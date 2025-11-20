import type { Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { R2StorageService } from "~/services/storage/r2-storage-service";
import { FailedToUpdateStoreError } from "~/use-cases/@errors/stores/failed-to-update-store-error";
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";
import { makeUpdateStoreUseCase } from "~/use-cases/@factories/stores/make-update-store-use-case";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";

/**
 * @swagger
 * /stores/{id}/logo:
 *   post:
 *     summary: Faz upload do logo da loja
 *     tags: [Stores]
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
 *         description: ID da loja
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem do logo
 *     responses:
 *       200:
 *         description: Logo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 store:
 *                   $ref: '#/components/schemas/Store'
 *       400:
 *         description: Erro de validação ou imagem não fornecida
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não tem permissão para acessar esta loja
 *       404:
 *         description: Loja não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
export async function uploadStoreLogoController(
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

		if (!request.file) {
			return response.status(400).json({
				message: "Imagem é obrigatória",
			});
		}

		// Verificar se a loja existe e se o usuário é dono
		const findStoreByIdUseCase = makeFindStoreByIdUseCase();
		const { store: existingStore } = await findStoreByIdUseCase.execute({ id });

		if (!existingStore) {
			return response.status(404).json({
				message: "Loja não encontrada",
			});
		}

		if (existingStore.ownerId !== request.user.id) {
			return response.status(403).json({
				message: "Você não tem permissão para acessar esta loja",
			});
		}

		// Extrair extensão do arquivo baseado no mimetype
		const mimeToExt: Record<string, string> = {
			"image/jpeg": "jpg",
			"image/jpg": "jpg",
			"image/png": "png",
			"image/webp": "webp",
			"image/gif": "gif",
		};
		const fileExtension = mimeToExt[request.file.mimetype] || "jpg";
		const fileName = `${id}-${Date.now()}.${fileExtension}`;

		const storageService = new R2StorageService();

		// Deletar imagem antiga se existir
		if (existingStore.logoUrl) {
			try {
				await storageService.deleteImage(existingStore.logoUrl, "stores");
			} catch (error) {
				// Não falhar se não conseguir deletar a imagem antiga
				console.warn("Erro ao deletar imagem antiga:", error);
			}
		}

		// Fazer upload da nova imagem
		const imageUrl = await storageService.uploadImageToPath(
			request.file.buffer,
			fileName,
			"vitrine",
		);

		// Atualizar a loja com a nova URL
		const updateStoreUseCase = makeUpdateStoreUseCase();
		const { store } = await updateStoreUseCase.execute({
			id,
			ownerId: request.user.id,
			data: {
				logoUrl: imageUrl,
			},
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
		console.error("Error uploading store logo:", error);

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

