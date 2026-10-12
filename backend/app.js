import express from "express";
import 'dotenv/config.js';
import routesUsuarios from "./routes/usuarios.js";

const app = express();

app.use('/usuarios', routesUsuarios);

try{
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log('Servidor activo en el puerto ' + PORT);
    });
} catch(e){
    console.log(e);
}