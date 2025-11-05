import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { createCityController } from "./create";
import { findAllCitiesController } from "./find-all";
import { updateCityController } from "./update-city";

export const citiesRoutes = Router();

citiesRoutes.post("/cities", authenticateMiddleware, createCityController);
// citiesRoutes.get("/cities/name-and-state", findCityByNameAndStateController);
citiesRoutes.get("/cities", findAllCitiesController);
citiesRoutes.put("/cities/:id", authenticateMiddleware, updateCityController);
