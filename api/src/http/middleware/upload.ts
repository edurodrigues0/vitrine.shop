import type { Request } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

// Tipos MIME permitidos
const ALLOWED_MIME_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
	"image/gif",
];

const fileFilter = (
	request: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	// Validar tipo MIME
	if (!file.mimetype.startsWith("image/")) {
		return cb(new Error("Only image files are allowed"));
	}

	// Validar MIME type específico
	if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
		return cb(
			new Error(
				`File type ${file.mimetype} not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
			),
		);
	}

	// Validar extensão do arquivo (backup)
	const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
	const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
	if (fileExtension && !allowedExtensions.includes(fileExtension)) {
		return cb(
			new Error(
				`File extension .${fileExtension} not allowed. Allowed extensions: ${allowedExtensions.join(", ")}`,
			),
		);
	}

	cb(null, true);
};

export const uploadMiddleware = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 1024 * 1024 * 5, // 5MB
		files: 10, // Máximo de 10 arquivos por requisição
	},
});

// Middleware para upload de imagem única
export const uploadSingleImage = uploadMiddleware.single("image");

// Middleware para upload de múltiplas imagens
export const uploadMultipleImages = uploadMiddleware.array("images", 10);
