import type * as schema from "~/database/schema";
import type { RidesRepository } from "~/repositories/rides-repository";

interface UpdateStatusUseCaseRequest {
	id: string;
	status: schema.RideStatus;
}

interface UpdateStatusUseCaseResponse {
	status: schema.RideStatus;
}

export class UpdateStatusUseCase {
	constructor(private readonly ridesRepository: RidesRepository) {}

	async execute({
		id,
		status,
	}: UpdateStatusUseCaseRequest): Promise<UpdateStatusUseCaseResponse> {
		const updatedStatus = await this.ridesRepository.updateStatus(id, status);

		if (!updatedStatus) {
			throw new Error("Ride not found");
		}

		return { status: updatedStatus.status };
	}
}
