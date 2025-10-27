import { Router } from "express";
import { createCityController } from "./create";
import { findCityByNameAndStateController } from "./find-by-name-and-state";

export const citiesRoutes = Router();

citiesRoutes.post("/cities", createCityController);
citiesRoutes.get("/cities", findCityByNameAndStateController);
