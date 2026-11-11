import express from "express";
import ejercicioGuardadoController from "../controllers/ejercicioGuardadoController.js";
import { requiereSesion } from "../middlewares/sesion.js";

const route = express.Router();

route.use(requiereSesion);

route.get("/", ejercicioGuardadoController.listar);
route.get("/:id", ejercicioGuardadoController.obtener);
route.post("/", ejercicioGuardadoController.guardar);
route.delete("/:id", ejercicioGuardadoController.borrar);

export default route;
