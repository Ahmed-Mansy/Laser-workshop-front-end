export interface Shift {
    id: number;
    opened_at: string;
    closed_at?: string;
    is_active: boolean;
    total_orders_delivered: number;
    total_revenue: number;
    duration_hours: number;
    opened_by?: number;
    opened_by_username?: string;
    closed_by?: number;
    closed_by_username?: string;
}
