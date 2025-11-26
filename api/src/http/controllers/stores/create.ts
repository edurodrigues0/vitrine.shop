import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
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
		primary: z.string().min(1, "Cor primária é obrigatória"),
		primaryGradient: z.string().optional(),
		secondary: z.string().min(1, "Cor secundária é obrigatória"),
		bg: z.string().min(1, "Cor de fundo é obrigatória"),
		surface: z.string().min(1, "Cor de superfície é obrigatória"),
		text: z.string().min(1, "Cor de texto é obrigatória"),
		textSecondary: z.string().min(1, "Cor de texto secundário é obrigatória"),
		highlight: z.string().min(1, "Cor de destaque é obrigatória"),
		border: z.string().min(1, "Cor de borda é obrigatória"),
		hover: z.string().min(1, "Cor de hover é obrigatória"),
		overlay: z.string().optional(),
	}),
	cityId: z.uuid("ID da cidade deve ser um UUID válido"),
});

/**
 * @swagger
 * /stores:
 *   post:
 *     summary: Cria uma nova loja
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - cnpjcpf
 *               - whatsapp
 *               - slug
 *               - theme
 *               - cityId
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 120
 *                 description: Nome da loja
 *                 example: "Minha Loja"
 *               description:
 *                 type: string
 *                 description: Descrição da loja
 *               cnpjcpf:
 *                 type: string
 *                 minLength: 11
 *                 maxLength: 14
 *                 description: CNPJ ou CPF da loja
 *                 example: "12345678901234"
 *               logoUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL do logo da loja
 *               whatsapp:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 20
 *                 description: Número do WhatsApp
 *                 example: "5511999999999"
 *               slug:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 120
 *                 description: Slug único da loja
 *                 example: "minha-loja"
 *               instagramUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL do Instagram
 *               facebookUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL do Facebook
 *               bannerUrl:
 *         description: Loja criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 store:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     cnpjcpf:
 *                       type: string
 *                     logoUrl:
 *                       type: string
 *                       nullable: true
 *                     whatsapp:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     instagramUrl:
 *                       type: string
 *                       nullable: true
 *                     facebookUrl:
 *                       type: string
 *                       nullable: true
 *                     bannerUrl:
 *                       type: string
 *                       nullable: true
 *                     theme:
 *                       type: object
 *                     cityId:
 *                       type: string
 *                       format: uuid
 *                     ownerId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [ACTIVE, INACTIVE]
 *                     isPaid:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: CNPJ/CPF, WhatsApp ou Slug já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function createStoreController(
	request: AuthenticatedRequest,
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

		const { store } = await createStoreUseCase.execute({
			name,
			description,
			bannerUrl,
			cityId,
			cnpjcpf,
			facebookUrl,
			instagramUrl,
			logoUrl,
			ownerId: request.user?.id || "",
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
