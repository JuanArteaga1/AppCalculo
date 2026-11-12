import express from "express";
import videoController from "../controllers/videoController.js";
import { sesionOpcional } from "../middlewares/sesion.js";

const route = express.Router();

// Sin sesión se ven los videos públicos; con sesión de administrador, todos.
route.use(sesionOpcional);
route.get("/", videoController.lista);

export default route;
