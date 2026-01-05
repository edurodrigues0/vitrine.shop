import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { AddressNotFoundError } from "~/use-cases/@errors/addresses/address-not-found-error";
import { makeUpdateAddressUseCase } from "~/use-cases/@factories/addresses/make-update-address-use-case";

const updateAddressBodySchema = z.object({
	street: z.string().min(1, "Rua é obrigatória").max(255, "Rua deve ter no máximo 255 caracteres").optional(),
	number: z.string().min(1, "Número é obrigatório").max(10, "Número deve ter no máximo 10 caracteres").optional(),
	complement: z.string().max(255, "Complemento deve ter no máximo 255 caracteres").nullable().optional(),
	neighborhood: z.string().min(1, "Bairro é obrigatório").max(100, "Bairro deve ter no máximo 100 caracteres").optional(),
	cityId: z.string().uuid("ID da cidade deve ser um UUID válido").optional(),
	zipCode: z.string().length(8, "CEP deve ter 8 caracteres").optional(),
	country: z.string().min(1, "País é obrigatório").max(50, "País deve ter no máximo 50 caracteres").optional(),
	storeId: z.string().uuid("ID da loja deve ser um UUID válido").nullable().optional(),
	isMain: z.boolean().optional(),
});

/**
 * @swagger
 * /addresses/{id}:
 *   put:
 *     summary: Atualiza um endereço existente
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do endereço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               number:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10
 *               complement:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *               neighborhood:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               cityId:
 *                 type: string
 *                 format: uuid
 *               zipCode:
 *                 type: string
 *                 length: 8
 *               country:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               storeId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               isMain:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Endereço atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     street:
 *                       type: string
 *                     number:
 *                       type: string
 *                     complement:
 *                       type: string
 *                       nullable: true
 *                     neighborhood:
 *                       type: string
 *                     cityId:
 *                       type: string
 *                       format: uuid
 *                     zipCode:
 *                       type: string
 *                     country:
 *                       type: string
 *                     storeId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     isMain:
 *                       type: boolean
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Endereço não encontrado
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
export async function updateAddressController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;

		console.log("📥 Recebendo requisição para atualizar endereço:", {
			id,
			body: request.body,
			userId: request.user?.id,
		});

		if (!id) {
			return response.status(400).json({
				message: "ID do endereço é obrigatório",
			});
		}

		const body = updateAddressBodySchema.parse(request.body);
		console.log("✅ Dados validados para atualização:", body);

		// Remover campos undefined para não enviar dados desnecessários
		const updateData = Object.fromEntries(
			Object.entries(body).filter(([_, value]) => value !== undefined),
		);

		if (Object.keys(updateData).length === 0) {
			return response.status(400).json({
				message: "Pelo menos um campo deve ser fornecido para atualização",
			});
		}

		const updateAddressUseCase = makeUpdateAddressUseCase();

		console.log("🔄 Executando use case para atualizar endereço...");
		const { address } = await updateAddressUseCase.execute({
			id,
			data: updateData,
		});

		if (!address) {
			console.log("❌ Endereço não encontrado para atualização");
			return response.status(404).json({
				message: "Endereço não encontrado",
			});
		}

		console.log("✅ Endereço atualizado com sucesso:", address.id);

		return response.status(200).json({
			address: {
				id: address.id,
				street: address.street,
				number: address.number,
				complement: address.complement,
				neighborhood: address.neighborhood,
				cityId: address.cityId,
				zipCode: address.zipCode,
				country: address.country,
				storeId: address.storeId,
				isMain: address.isMain,
			},
		});
	} catch (error) {
		console.error("Error updating address:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof AddressNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

