export type OrderStatus = 'UNDER_WORK' | 'DESIGNING' | 'DESIGN_COMPLETED' | 'DELIVERED';

export interface Order {
    id: number;
    customer_name: string;
    customer_phone: string;
    order_details: string;
    image?: string;
    price?: number;
    status: OrderStatus;
    status_display: string;
    created_by: number;
    created_by_username: string;
    created_at: string;
    updated_at: string;
    delivered_at?: string;
}

export interface OrderCreate {
    customer_name: string;
    customer_phone: string;
    order_details: string;
    image?: File;
    status?: OrderStatus;
}

export interface OrderUpdate {
    customer_name?: string;
    customer_phone?: string;
    order_details?: string;
    image?: File;
    price?: number;
    status?: OrderStatus;
}

export interface OrderStatusUpdate {
    status: OrderStatus;
}

export interface OrderShowcase {
    id: number;
    customer_name: string;
    image?: string;
    order_details: string;
    delivered_at: string;
}

export interface OrderStatistics {
    total: number;
    by_status: { [key: string]: number };
    delivered_this_month?: number;
}
