import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { StoreWithSameCnpjCpfError } from "~/use-cases/@errors/stores/store-with-same-cpnjcpf-error";
import { StoreWithSameSlugError } from "~/use-cases/@errors/stores/store-with-same-slug";
import { StoreWithSameWhatsappError } from "~/use-cases/@errors/stores/store-with-same-whatsapp-error";
import { makeCreateStoreUseCase } from "~/use-cases/@factories/stores/make-create-store-use-case";

const createStoreBodySchema = z.object({
	name: z
		.string()
		.min(1, "Nome é obrigatório")
		.max(120, "Nome deve ter no máximo 120 caracteres"),
	description: z.string().optional(),
	cnpjcpf: z
		.string()
		.min(11, "CNPJ/CPF deve ter pelo menos 11 caracteres")
		.max(14, "CNPJ/CPF deve ter no máximo 14 caracteres"),
	logoUrl: z.string().url("Logo URL deve ser uma URL válida").optional(),
	whatsapp: z
		.string()
		.min(10, "WhatsApp deve ter pelo menos 10 caracteres")
		.max(20, "WhatsApp deve ter no máximo 20 caracteres"),
	slug: z
		.string()
		.min(1, "Slug é obrigatório")
		.max(120, "Slug deve ter no máximo 120 caracteres"),
	instagramUrl: z.url("Instagram URL deve ser uma URL válida").optional(),
	facebookUrl: z.url("Facebook URL deve ser uma URL válida").optional(),
	bannerUrl: z.url("Banner URL deve ser uma URL válida").optional(),
	theme: z.object({
		primaryColor: z.string().min(1, "Cor primária é obrigatória"),
		secondaryColor: z.string().min(1, "Cor secundária é obrigatória"),
		tertiaryColor: z.string().min(1, "Cor terciária é obrigatória"),
	}),
	cityId: z.uuid("ID da cidade deve ser um UUID válido"),
});

export async function createStoreController(
	request: Request,
	response: Response,
) {
	try {
		const {
			name,
			description,
			bannerUrl,
			cityId,
			cnpjcpf,
			facebookUrl,
			instagramUrl,
			logoUrl,
			slug,
			theme,
			whatsapp,
		} = createStoreBodySchema.parse(request.body);

		const createStoreUseCase = makeCreateStoreUseCase();

		const { store } = await createStoreUseCase.execucte({
			name,
			description,
			bannerUrl,
			cityId,
			cnpjcpf,
			facebookUrl,
			instagramUrl,
			logoUrl,
			ownerId: request.user!.id,
			slug,
			theme,
			whatsapp,
		});

		return response.status(201).json({
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
		console.error("Error creating store:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
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

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
