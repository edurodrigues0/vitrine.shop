import { Router } from "express";
import { createCityController } from "./create";
import { findAllCitiesController } from "./find-all";
import { updateCityController } from "./update-city";

export const citiesRoutes = Router();

citiesRoutes.post("/cities", createCityController);
// citiesRoutes.get("/cities/name-and-state", findCityByNameAndStateController);
citiesRoutes.get("/cities", findAllCitiesController);
citiesRoutes.put("/cities/:id", updateCityController);
