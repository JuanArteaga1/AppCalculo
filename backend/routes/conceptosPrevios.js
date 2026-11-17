import express from "express";
import conceptosPreviosController from "../controllers/conceptosPreviosController.js";
import { sesionOpcional } from "../middlewares/sesion.js";

const route = express.Router();

route.use(sesionOpcional);
route.get("/", conceptosPreviosController.lista);
route.get("/:slug", conceptosPreviosController.detalle);

export default route;
