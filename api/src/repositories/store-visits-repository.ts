export interface CreateStoreVisitParams {
	storeId: string;
	ipAddress?: string;
	userAgent?: string;
}

export interface StoreVisitsRepository {
	create(params: CreateStoreVisitParams): Promise<void>;
	countByStoreId(params: { storeId: string }): Promise<number>;
	countByStoreIdAndPeriod(params: {
		storeId: string;
		startDate: Date;
		endDate: Date;
	}): Promise<number>;
}

