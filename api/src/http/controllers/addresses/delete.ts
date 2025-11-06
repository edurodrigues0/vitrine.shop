import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { AddressNotFoundError } from "~/use-cases/@errors/addresses/address-not-found-error";
import { makeDeleteAddressUseCase } from "~/use-cases/@factories/addresses/make-delete-address-use-case";

const deleteAddressParamsSchema = z.object({
	id: z.string().uuid(),
});

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Exclui um endereço
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
 *     responses:
 *       204:
 *         description: Endereço excluído com sucesso
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
export async function deleteAddressController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = deleteAddressParamsSchema.parse(request.params);

		const deleteAddressUseCase = makeDeleteAddressUseCase();

		await deleteAddressUseCase.execute({ id });

		return response.status(204).send();
	} catch (error) {
		console.error("Error deleting address:", error);

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

