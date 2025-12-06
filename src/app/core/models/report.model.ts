export interface DailyReport {
    date: string;
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    orders_by_status: { [key: string]: number };
    orders: any[];
}

export interface MonthlyReport {
    year: number;
    month: number;
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    orders_by_status: { [key: string]: number };
    daily_breakdown: DailyBreakdown[];
}

export interface DailyBreakdown {
    day: number;
    count: number;
    revenue: number;
}

export interface OrderStatistics {
    total: number;
    by_status: { [key: string]: number };
    delivered_this_month?: number;
}
