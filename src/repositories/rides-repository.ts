import type { Location, Ride, RideStatus } from "~/database/schema";

export interface CreateRideParams {
	driverId: string;
	passengerId: string;
	startLocation: Location;
	endLocation: Location;
	startDate?: Date | null;
	endDate?: Date | null;
	distance: number;
	amountCents: number;
	description?: string | null;
	idempotencyKey?: string;
}

export interface UpdateRideParams {
	id: string;
	driverId?: string;
	passengerId?: string;
	startLocation?: Location;
	endLocation?: Location;
	startDate?: Date;
	endDate?: Date;
	distance?: number;
	amountCents?: number;
	description?: string | null;
	idempotencyKey?: string;
}

export interface RidesRepository {
	create({
		driverId,
		passengerId,
		startLocation,
		endLocation,
		startDate,
		endDate,
		distance,
		amountCents,
		description,
		idempotencyKey,
	}: CreateRideParams): Promise<Ride>;

	findById({ id }: { id: string }): Promise<Ride | null>;

	update({
		id,
		driverId,
		passengerId,
		startLocation,
		endLocation,
		startDate,
		endDate,
		distance,
		amountCents,
		description,
		idempotencyKey,
	}: UpdateRideParams): Promise<Ride | null>;

	delete({ id }: { id: string }): Promise<void>;

	// Consultas específicas do domínio
	findActiveByDriverId(driverId: string): Promise<Ride | null>;
	findActiveByPassengerId(passengerId: string): Promise<Ride | null>;
	findAllByDriverId(driverId: string): Promise<Ride[]>;
	findAllByPassengerId(passengerId: string): Promise<Ride[]>;

	// Operações auxiliares (opcional, conforme sua lógica)
	findPending(): Promise<Ride[]>; // ex: para motoristas verem corridas disponíveis
	updateStatus(
		id: string,
		status: RideStatus,
	): Promise<{ status: RideStatus } | null>; // ex: para motoristas aceitarem ou rejeitarem corridas
}
