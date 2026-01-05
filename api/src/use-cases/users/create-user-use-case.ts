import { hash } from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "~/config/constants";
import type * as schema from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";
import type { SubscriptionsRepository } from "~/repositories/subscriptions-repository";
import type { UsersRepository } from "~/repositories/users-repository";
import { PlanLimitsService } from "~/services/plan-limits-service";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";
import { SubscriptionRequiredError } from "../@errors/plans/subscription-required-error";
import { UserAlreadyExistsError } from "../@errors/users/user-already-exists-error";
import { UserLimitExceededError } from "../@errors/plans/user-limit-exceeded-error";

interface CreateUserUseCaseRequest {
	name: string;
	email: string;
	password: string;
	role: schema.UserRole;
	storeId?: string | null;
}

interface CreateUserUseCaseResponse {
	user: Omit<schema.User, "password">;
}

export class CreateUserUseCase {
	constructor(
		private readonly usersRepository: UsersRepository,
		private readonly storesRepository: StoresRepository,
		private readonly subscriptionsRepository: SubscriptionsRepository,
	) {}

	async execute({
		name,
		email,
		password,
		role,
		storeId,
	}: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
		const userWithSameEmail = await this.usersRepository.findByEmail({ email });

		if (userWithSameEmail) {
			throw new UserAlreadyExistsError();
		}

		// Validar limite de usuários se storeId foi fornecido
		if (storeId) {
			// Buscar loja
			const store = await this.storesRepository.findById({ id: storeId });

			if (!store) {
				throw new StoreNotFoundError();
			}

			// Buscar assinatura do dono da loja
			const subscription = await this.subscriptionsRepository.findByUserId({
				userId: store.ownerId,
			});

			// Validar se assinatura existe e está ativa
			if (!subscription) {
				throw new SubscriptionRequiredError();
			}

			if (subscription.status !== "PAID") {
				throw new SubscriptionRequiredError();
			}

			// Verificar se a assinatura não expirou
			const now = new Date();
			const periodEnd = new Date(subscription.currentPeriodEnd);

			if (now > periodEnd) {
				throw new SubscriptionRequiredError();
			}

			// Validar limite de usuários do plano
			const limits = PlanLimitsService.getLimits(subscription.planId);

			if (limits.maxUsers !== null) {
				const userCount = await this.usersRepository.countByStoreId({
					storeId,
				});

				if (PlanLimitsService.hasReachedLimit(userCount, limits.maxUsers)) {
					throw new UserLimitExceededError(
						limits.maxUsers,
						userCount,
						subscription.planId,
					);
				}
			}
		}

		const passwordHash = await hash(password, BCRYPT_SALT_ROUNDS);

		const user = await this.usersRepository.create({
			name,
			email,
			password: passwordHash,
			role,
			storeId,
		});

		return { user };
	}
}
