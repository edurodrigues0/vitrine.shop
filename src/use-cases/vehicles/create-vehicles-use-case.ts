import type * as schema from "~/database/schema";
import type { VehiclesRepository } from "~/repositories/vehicles-repository";

interface CreateVehicleUseCaseRequest {
	driverId: string;
	vehicleType: schema.VehicleType;
	plate: string;
	color: string;
	brand: string;
	model: string;
	year: number;
}

interface CreateVehicleUseCaseResponse {
	vehicle: schema.Vehicle;
}

export class CreateVehicleUseCase {
	constructor(private readonly vehiclesRepository: VehiclesRepository) {}

	async execute({
		driverId,
		brand,
		color,
		model,
		plate,
		year,
		vehicleType,
	}: CreateVehicleUseCaseRequest): Promise<CreateVehicleUseCaseResponse> {
		const vehicleWithSamePlate =
			await this.vehiclesRepository.findVehicleByPlate(plate);

		if (vehicleWithSamePlate) {
			throw new Error("Vehicle with same plate already exists");
		}

		const vehicle = await this.vehiclesRepository.create({
			driverId,
			vehicleType,
			plate,
			color,
			brand,
			model,
			year,
		});

		return { vehicle };
	}
}
