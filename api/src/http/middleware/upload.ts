import type { Request } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
	request: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
) => {
	// Aceita apenas imagens
	if (file.mimetype.startsWith("image/*")) {
		cb(null, true);
	} else {
		cb(new Error("Only images are allowed"));
	}
};

export const uploadMiddleware = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 1024 * 1024 * 5, // 5MB
	},
});
