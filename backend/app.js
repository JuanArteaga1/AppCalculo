import express from "express";
import 'dotenv/config.js';
import routesUsuarios from "./routes/usuarios.js";
import bodyParser from "body-parser";
import dbClient from "./config/dbClient.js";
import cors from 'cors';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use('/usuarios', routesUsuarios);

try{
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('Servidor activo en el puerto ' + PORT);
    });
} catch(e){
    console.log(e);
}

process.on('SIGINT', async () => {
    dbClient.cerrarConexion();
    process.exit(0);
});