import 'dotenv/config.js';

import {MongoClient} from "mongodb";

class dbClient {
    constructor() {
        const queryString = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/?appName=PlataformaEducativa`;
        this.client = new MongoClient(queryString);
        this.conectarBD();
    }
    async conectarBD() {
        try {
            await this.client.connect();
            this.db = this.client.db('PlataformaEducativa');
            console.log("Conexión a la base de datos establecida");
        } catch (e) {
            console.log(e);
        }
    }
}

export default new dbClient;