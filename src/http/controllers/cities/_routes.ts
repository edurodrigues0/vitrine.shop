import { Router } from "express";
import { createCityController } from "./create";

export const citiesRoutes = Router();

citiesRoutes.post("/cities", createCityController);
