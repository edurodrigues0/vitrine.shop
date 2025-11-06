import { api } from "@/lib/api-client";

export interface SalesAnalyticsResponse {
	sales: Array<{
		date: string;
		revenue: number;
		orders: number;
		averageTicket: number;
	}>;
	period: {
		start: string;
		end: string;
		groupBy: string;
	};
}

export interface ProductsAnalyticsResponse {
	topProducts: Array<{
		productId: string;
		productName: string;
		quantitySold: number;
		revenue: number;
	}>;
	outOfStockProducts: Array<{
		productId: string;
		productName: string;
	}>;
	period: {
		start: string;
		end: string;
	};
}

export interface CustomersAnalyticsResponse {
	topCustomers: Array<{
		customerName: string;
		customerPhone: string;
		orderCount: number;
		totalSpent: number;
		averageTicket: number;
	}>;
	uniqueCustomers: number;
	recurringCustomers: number;
	averageTicket: number;
	period: {
		start: string;
		end: string;
	};
}

export const analyticsService = {
	getSales: async (
		storeId: string,
		params?: {
			startDate?: string;
			endDate?: string;
			groupBy?: "day" | "week" | "month";
		},
	): Promise<SalesAnalyticsResponse> => {
		const queryParams: Record<string, string> = {};
		if (params?.startDate) queryParams.startDate = params.startDate;
		if (params?.endDate) queryParams.endDate = params.endDate;
		if (params?.groupBy) queryParams.groupBy = params.groupBy;

		const response = await api.get<SalesAnalyticsResponse>(
			`/stores/${storeId}/analytics/sales`,
			queryParams,
		);
		return response;
	},

	getProducts: async (
		storeId: string,
		params?: {
			startDate?: string;
			endDate?: string;
			limit?: number;
		},
	): Promise<ProductsAnalyticsResponse> => {
		const queryParams: Record<string, string> = {};
		if (params?.startDate) queryParams.startDate = params.startDate;
		if (params?.endDate) queryParams.endDate = params.endDate;
		if (params?.limit) queryParams.limit = params.limit.toString();

		const response = await api.get<ProductsAnalyticsResponse>(
			`/stores/${storeId}/analytics/products`,
			queryParams,
		);
		return response;
	},

	getCustomers: async (
		storeId: string,
		params?: {
			startDate?: string;
			endDate?: string;
		},
	): Promise<CustomersAnalyticsResponse> => {
		const queryParams: Record<string, string> = {};
		if (params?.startDate) queryParams.startDate = params.startDate;
		if (params?.endDate) queryParams.endDate = params.endDate;

		const response = await api.get<CustomersAnalyticsResponse>(
			`/stores/${storeId}/analytics/customers`,
			queryParams,
		);
		return response;
	},
};

