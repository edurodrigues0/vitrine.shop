import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { FailedToUpdateStoreError } from "~/use-cases/@errors/stores/failed-to-update-store-error";
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";
import { StoreWithSameCnpjCpfError } from "~/use-cases/@errors/stores/store-with-same-cpnjcpf-error";
import { StoreWithSameSlugError } from "~/use-cases/@errors/stores/store-with-same-slug";
import { StoreWithSameWhatsappError } from "~/use-cases/@errors/stores/store-with-same-whatsapp-error";
import { makeUpdateStoreUseCase } from "~/use-cases/@factories/stores/make-update-store-use-case";

const updateStoreBodySchema = z.object({
	name: z
		.string()
		.min(1, "Nome é obrigatório")
		.max(120, "Nome deve ter no máximo 120 caracteres")
		.optional(),
	description: z.string().optional(),
	cnpjcpf: z
		.string()
		.min(11, "CNPJ/CPF deve ter pelo menos 11 caracteres")
		.max(14, "CNPJ/CPF deve ter no máximo 14 caracteres")
		.optional(),
	logoUrl: z.string().url("Logo URL deve ser uma URL válida").optional(),
	whatsapp: z
		.string()
		.min(10, "WhatsApp deve ter pelo menos 10 caracteres")
		.max(20, "WhatsApp deve ter no máximo 20 caracteres")
		.optional(),
	slug: z
		.string()
		.min(1, "Slug é obrigatório")
		.max(120, "Slug deve ter no máximo 120 caracteres")
		.optional(),
	instagramUrl: z.url("Instagram URL deve ser uma URL válida").optional(),
	facebookUrl: z.url("Facebook URL deve ser uma URL válida").optional(),
	bannerUrl: z.url("Banner URL deve ser uma URL válida").optional(),
	theme: z
		.object({
			primaryColor: z.string().min(1, "Cor primária é obrigatória"),
			secondaryColor: z.string().min(1, "Cor secundária é obrigatória"),
			tertiaryColor: z.string().min(1, "Cor terciária é obrigatória"),
		})
		.optional(),
	cityId: z.uuid("ID da cidade deve ser um UUID válido").optional(),
});

export async function updateStoreController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;

		if (!id) {
			return response.status(400).json({
				message: "ID da loja é obrigatório",
			});
		}

		if (!request.user) {
			return response.status(401).json({
				message: "Usuário não autenticado",
			});
		}

		const body = updateStoreBodySchema.parse(request.body);

		// Remover campos undefined para não enviar dados desnecessários
		const updateData = Object.fromEntries(
			Object.entries(body).filter(([_, value]) => value !== undefined),
		);

		if (Object.keys(updateData).length === 0) {
			return response.status(400).json({
				message: "Pelo menos um campo deve ser fornecido para atualização",
			});
		}

		const updateStoreUseCase = makeUpdateStoreUseCase();

		const { store } = await updateStoreUseCase.execute({
			id,
			ownerId: request.user.id,
			data: updateData,
		});

		if (!store) {
			return response.status(500).json({
				message: "Falha ao atualizar a loja",
			});
		}

		return response.status(200).json({
			store: {
				id: store.id,
				name: store.name,
				description: store.description,
				cnpjcpf: store.cnpjcpf,
				logoUrl: store.logoUrl,
				whatsapp: store.whatsapp,
				slug: store.slug,
				instagramUrl: store.instagramUrl,
				facebookUrl: store.facebookUrl,
				bannerUrl: store.bannerUrl,
				theme: store.theme,
				cityId: store.cityId,
				ownerId: store.ownerId,
				status: store.status,
				isPaid: store.isPaid,
				createdAt: store.createdAt,
				updatedAt: store.updatedAt,
			},
		});
	} catch (error) {
		console.error("Error updating store:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof StoreNotFoundError) {
			return response.status(404).json({
				message: "Loja não encontrada",
			});
		}

		if (error instanceof StoreWithSameCnpjCpfError) {
			return response.status(409).json({
				message: error.message,
			});
		}

		if (error instanceof StoreWithSameWhatsappError) {
			return response.status(409).json({
				message: error.message,
			});
		}

		if (error instanceof StoreWithSameSlugError) {
			return response.status(409).json({
				message: error.message,
			});
		}

		if (error instanceof FailedToUpdateStoreError) {
			return response.status(500).json({
				message: "Falha ao atualizar a loja",
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
