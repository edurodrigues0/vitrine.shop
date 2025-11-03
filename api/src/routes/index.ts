import { Router, type Request, type Response } from "express";

const router = Router();

// Exemplo de rota de transações
router.get("/transactions", (_req: Request, res: Response) => {
	res.json({
		message: "Lista de transações",
		data: [],
	});
});

// Exemplo de rota de empresas
router.get("/companies", (_req: Request, res: Response) => {
	res.json({
		message: "Lista de empresas",
		data: [],
	});
});

// Exemplo de rota de usuários
router.get("/users", (_req: Request, res: Response) => {
	res.json({
		message: "Lista de usuários",
		data: [],
	});
});

export default router;
