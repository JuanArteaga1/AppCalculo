import 'dotenv/config.js';
import mongoose from "mongoose";

import {MongoClient} from "mongodb";

class dbClient {
    constructor() {
        this.conectarBaseDatos();
    }

     async conectarBaseDatos() {
        try {
            const queryString = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/PlataformaEducativa?retryWrites=true&w=majority`;

            await mongoose.connect(queryString);

            console.log("Conexión a la base de datos establecida");
        } catch (e) {
            console.error("Error al conectar con MongoDB:", e.message);
        }
    }

    //Metodo para cerrar la conexión a la base de datos
    async cerrarConexion() {
        try {
            await mongoose.disconnect();
            console.log("Conexión a la base de datos cerrada");
        } catch (e) {
            console.log(e);
        }
    }
    /*
    async conectarBD() {
        try {
            await this.client.connect();
            this.db = this.client.db('PlataformaEducativa');
            console.log("Conexión a la base de datos establecida");
        } catch (e) {
            console.log(e);
        }
    }*/
}

export default new dbClient();