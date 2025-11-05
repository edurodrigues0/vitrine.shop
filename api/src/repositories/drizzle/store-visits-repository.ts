import { and, count, eq, gte, lte } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { storeVisits } from "~/database/schema";
import type {
	CreateStoreVisitParams,
	StoreVisitsRepository,
} from "../store-visits-repository";

export class DrizzleStoreVisitsRepository implements StoreVisitsRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({
		storeId,
		ipAddress,
		userAgent,
	}: CreateStoreVisitParams): Promise<void> {
		await this.drizzle.insert(storeVisits).values({
			storeId,
			ipAddress: ipAddress ?? null,
			userAgent: userAgent ?? null,
		});
	}

	async countByStoreId({ storeId }: { storeId: string }): Promise<number> {
		const [result] = await this.drizzle
			.select({ count: count() })
			.from(storeVisits)
			.where(eq(storeVisits.storeId, storeId));

		return Number(result?.count || 0);
	}

	async countByStoreIdAndPeriod({
		storeId,
		startDate,
		endDate,
	}: {
		storeId: string;
		startDate: Date;
		endDate: Date;
	}): Promise<number> {
		const [result] = await this.drizzle
			.select({ count: count() })
			.from(storeVisits)
			.where(
				and(
					eq(storeVisits.storeId, storeId),
					gte(storeVisits.visitedAt, startDate),
					lte(storeVisits.visitedAt, endDate),
				),
			);

		return Number(result?.count || 0);
	}
}

