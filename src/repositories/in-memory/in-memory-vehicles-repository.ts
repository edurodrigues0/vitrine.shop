import type { Vehicle } from "~/database/schema";
import type {
	CreateVehicleParams,
	FindAllVehiclesParams,
	UpdateVehicleParams,
	VehiclesRepository,
} from "../vehicles-repository";

export class InMemoryVehiclesRepository implements VehiclesRepository {
	public items: Vehicle[] = [];

	async create(params: CreateVehicleParams): Promise<Vehicle> {
		const vehicle: Vehicle = {
			id: crypto.randomUUID(),
			driverId: params.driverId,
			brand: params.brand,
			color: params.color,
			model: params.model,
			year: params.year,
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			vehicleType: params.vehicleType,
			plate: params.plate,
		};

		this.items.push(vehicle);

		return vehicle;
	}

	async findVehicleByPlate(plate: string): Promise<Vehicle | null> {
		const vehicle = this.items.find((item) => item.plate === plate);
		return vehicle || null;
	}

	async findAllVehicles(params: FindAllVehiclesParams): Promise<{
		vehicles: Vehicle[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const { page, limit, filters } = params;

		let vehicles = this.items;

		const { brand, model, plate, type } = filters || {};

		if (brand) {
			vehicles = vehicles.filter((item) =>
				item.brand.toLowerCase().includes(brand.toLowerCase()),
			);
		}

		if (model) {
			vehicles = vehicles.filter((item) =>
				item.model.toLowerCase().includes(model.toLowerCase()),
			);
		}

		if (plate) {
			vehicles = vehicles.filter((item) =>
				item.plate.toLowerCase().includes(plate.toLowerCase()),
			);
		}

		if (type) {
			vehicles = vehicles.filter((item) => item.vehicleType === filters.type);
		}

		const totalItems = vehicles.length;
		const totalPages = Math.ceil(totalItems / limit);
		const paginatedVehicles = vehicles.slice((page - 1) * limit, page * limit);

		return {
			vehicles: paginatedVehicles,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async findVehicleById(id: string): Promise<Vehicle | null> {
		const vehicle = this.items.find((item) => item.id === id);

		return vehicle || null;
	}

	async findVehicleByDriverId(driverId: string): Promise<Vehicle[]> {
		const vehicles = this.items.filter((item) => item.driverId === driverId);

		return vehicles;
	}

	async updateVehicle(
		id: string,
		params: UpdateVehicleParams,
	): Promise<Vehicle | null> {
		const vehicleIndex = this.items.findIndex((item) => item.id === id);

		if (vehicleIndex < 0) {
			return null;
		}

		const currentVehicle = this.items[vehicleIndex];

		if (!currentVehicle) {
			return null;
		}

		const updatedVehicle: Vehicle = {
			...currentVehicle,
			...params,
			updatedAt: new Date(),
		};

		this.items[vehicleIndex] = updatedVehicle;
		return updatedVehicle;
	}

	async deleteVehicle(id: string): Promise<void> {
		const vehicleIndex = this.items.findIndex((item) => item.id === id);
		if (vehicleIndex > -1) {
			this.items.splice(vehicleIndex, 1);
		}
	}
}
