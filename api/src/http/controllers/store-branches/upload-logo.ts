import type { Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { DrizzleORM } from "~/database/connection";
import { DrizzleStoreBranchesRepository } from "~/repositories/drizzle/store-branches-repository";
import { R2StorageService } from "~/services/storage/r2-storage-service";
import { BranchNotFoundError } from "~/use-cases/@errors/store-branches/branch-not-found-error";
import { makeUpdateStoreBranchUseCase } from "~/use-cases/@factories/store-branches/make-update-store-branch-use-case";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";

/**
 * @swagger
 * /store-branches/{id}/logo:
 *   post:
 *     summary: Faz upload do logo da filial
 *     tags: [Store Branches]
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
 *         description: ID da filial
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
 *                 branch:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     parentStoreId:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     cityId:
 *                       type: string
 *                       format: uuid
 *                     isMain:
 *                       type: boolean
 *                     whatsapp:
 *                       type: string
 *                       nullable: true
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     logoUrl:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação ou imagem não fornecida
 *       401:
 *         description: Usuário não autenticado
 *       403:
 *         description: Usuário não tem permissão para acessar esta filial
 *       404:
 *         description: Filial não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
export async function uploadStoreBranchLogoController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;

		if (!id) {
			return response.status(400).json({
				message: "ID da filial é obrigatório",
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

		// Buscar a filial para obter a loja pai
		const storeBranchesRepository = new DrizzleStoreBranchesRepository(DrizzleORM);
		const existingBranch = await storeBranchesRepository.findById({ id });

		if (!existingBranch) {
			return response.status(404).json({
				message: "Filial não encontrada",
			});
		}

		// Verificar se o usuário é dono da loja pai
		const findStoreByIdUseCase = makeFindStoreByIdUseCase();
		const { store: parentStore } = await findStoreByIdUseCase.execute({
			id: existingBranch.parentStoreId,
		});

		if (!parentStore) {
			return response.status(404).json({
				message: "Loja pai não encontrada",
			});
		}

		if (parentStore.ownerId !== request.user.id) {
			return response.status(403).json({
				message: "Você não tem permissão para acessar esta filial",
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
		if (existingBranch.logoUrl) {
			try {
				await storageService.deleteImage(existingBranch.logoUrl, "branches");
			} catch (error) {
				// Não falhar se não conseguir deletar a imagem antiga
				console.warn("Erro ao deletar imagem antiga:", error);
			}
		}

		// Fazer upload da nova imagem
		const imageUrl = await storageService.uploadImageToPath(
			request.file.buffer,
			fileName,
			"branches",
		);

		// Atualizar a filial com a nova URL
		const updateStoreBranchUseCase = makeUpdateStoreBranchUseCase();
		const { branch } = await updateStoreBranchUseCase.execute({
			id,
			data: {
				logoUrl: imageUrl,
			},
		});

		return response.status(200).json({
			branch,
		});
	} catch (error) {
		console.error("Error uploading store branch logo:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof BranchNotFoundError) {
			return response.status(404).json({
				message: "Filial não encontrada",
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

