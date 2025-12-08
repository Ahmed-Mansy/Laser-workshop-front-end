import { Injectable, OnDestroy, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface WebSocketMessage {
    type: 'connection_established' | 'order_update' | 'shift_update';
    action?: 'created' | 'updated' | 'deleted';
    order?: any;
    shift?: any;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
    private authService = inject(AuthService);
    private socket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000; // 3 seconds
    private reconnectTimeoutId?: any;

    // Signals for reactive state
    readonly connected = signal(false);
    readonly orderUpdate = signal<WebSocketMessage | null>(null);
    readonly shiftUpdate = signal<WebSocketMessage | null>(null);

    constructor() {
        // Auto-connect when user is authenticated
        const user = this.authService.currentUser();
        if (user) {
            this.connect();
        }
    }

    /**
     * Connect to WebSocket server
     */
    connect(): void {
        // Don't reconnect if already connected
        if (this.socket?.readyState === WebSocket.OPEN) {
            return;
        }

        // Get auth token
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.warn('WebSocket: No auth token found');
            return;
        }

        // Create WebSocket URL with token from environment
        const wsUrl = `${environment.wsUrl}?token=${token}`;

        console.log('WebSocket: Connecting...', wsUrl);

        try {
            this.socket = new WebSocket(wsUrl);

            // Connection opened
            this.socket.onopen = () => {
                console.log('WebSocket: Connected');
                this.connected.set(true);
                this.reconnectAttempts = 0;
            };

            // Listen for messages
            this.socket.onmessage = (event) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    console.log('WebSocket: Message received', data);

                    // Update signals based on message type
                    if (data.type === 'order_update') {
                        this.orderUpdate.set(data);
                    } else if (data.type === 'shift_update') {
                        this.shiftUpdate.set(data);
                    } else if (data.type === 'connection_established') {
                        console.log('WebSocket: Connection established -', data.message);
                    }
                } catch (error) {
                    console.error('WebSocket: Failed to parse message', error);
                }
            };

            // Connection closed
            this.socket.onclose = (event) => {
                console.log('WebSocket: Disconnected', event.code, event.reason);
                this.connected.set(false);
                this.socket = null;

                // Handle Auth Failure (often code 1006 with no reason, or if we want to be proactive)
                // If it closed immediately or with specific error, try refreshing token
                if (!event.wasClean) {
                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        // If we suspect auth error (e.g. quick disconnect), try refreshing token first
                        // A 401 usually results in instant disconnection. 
                        // Since we can't easily read HTTP status codes from WS API, we infer.
                        if (this.reconnectAttempts === 0) {
                            this.handlePotentialAuthError();
                        } else {
                            this.scheduleReconnect();
                        }
                    }
                }
            };

            // Connection error
            this.socket.onerror = (error) => {
                console.error('WebSocket: Error', error);
                this.connected.set(false);
            };
        } catch (error) {
            console.error('WebSocket: Failed to create connection', error);
        }
    }

    /**
     * Handle potential authentication error
     */
    private handlePotentialAuthError(): void {
        console.log('WebSocket: Potential auth error, attempting to refresh token...');

        // Use existing refresh logic from AuthService if possible, or manually call endpoint?
        // Ideally we should inject AuthService and call refreshToken()
        // But AuthService has side effects (updating localStorage).

        this.authService.refreshToken().subscribe({
            next: () => {
                console.log('WebSocket: Token refreshed, reconnecting...');
                this.reconnectAttempts++; // Count this as an attempt
                this.connect();
            },
            error: (err) => {
                console.error('WebSocket: Failed to refresh token', err);
                this.scheduleReconnect(); // Fallback to normal reconnect
            }
        });
    }

    /**
     * Schedule reconnection attempt
     */
    private scheduleReconnect(): void {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;

        console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        this.reconnectTimeoutId = setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = undefined;
        }

        if (this.socket) {
            // Remove listeners to prevent loops
            this.socket.onclose = null;
            this.socket.onerror = null;

            console.log('WebSocket: Disconnecting...');
            this.socket.close(1000, 'Client disconnect');
            this.socket = null;
        }

        this.connected.set(false);
        this.reconnectAttempts = 0;
    }

    /**
     * Send message to WebSocket server (if needed in future)
     */
    send(data: any): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket: Cannot send message - not connected');
        }
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
