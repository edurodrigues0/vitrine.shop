import type * as schema from "~/database/schema";

export interface CreateVehicleParams {
	driverId: string;
	vehicleType: schema.VehicleType;
	plate: string;
	color: string;
	brand: string;
	model: string;
	year: number;
}

export interface FindAllVehiclesParams {
	page: number;
	limit: number;
	filters: {
		plate?: string;
		brand?: string;
		model?: string;
		type?: schema.VehicleType;
	};
}

export interface UpdateVehicleParams {
	id: string;
	name?: string;
	email?: string;
	password?: string;
	type?: schema.VehicleType;
}

export interface VehiclesRepository {
	create(
		params: CreateVehicleParams,
	): Promise<typeof schema.vehicles.$inferSelect>;

	findVehicleByPlate(
		plate: string,
	): Promise<typeof schema.vehicles.$inferSelect | null>;

	findVehicleByDriverId(
		driverId: string,
	): Promise<(typeof schema.vehicles.$inferSelect)[]>;

	findVehicleById(
		id: string,
	): Promise<typeof schema.vehicles.$inferSelect | null>;

	findAllVehicles(params: FindAllVehiclesParams): Promise<{
		vehicles: (typeof schema.vehicles.$inferSelect)[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}>;

	updateVehicle(
		id: string,
		params: UpdateVehicleParams,
	): Promise<typeof schema.vehicles.$inferSelect | null>;

	deleteVehicle(id: string): Promise<void>;
}
