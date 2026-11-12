import express from "express";
import temaController from "../controllers/temaController.js";
import { sesionOpcional } from "../middlewares/sesion.js";

const route = express.Router();

// La sesión es opcional: el administrador ve temas privados; los demás, 404.
route.use(sesionOpcional);

route.get('/', temaController.curso);
route.get('/:modulo/:numero', temaController.publicado);

export default route;
