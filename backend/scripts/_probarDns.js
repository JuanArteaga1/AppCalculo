import dns from "node:dns/promises";
import { setDefaultResultOrder } from "node:dns";

const host = "plataformaeducativa.lb5ees9.mongodb.net";
const srv = `_mongodb._tcp.${host}`;

setDefaultResultOrder("ipv4first");

async function probar(etiqueta, servidores) {
    if (servidores) dns.setServers(servidores);
    console.log("---", etiqueta, "servidores:", dns.getServers().join(", "));
    try {
        const srvRes = await dns.resolveSrv(srv);
        console.log("SRV OK", srvRes);
    } catch (e) {
        console.log("SRV fallo:", e.code, e.message);
    }
    try {
        const txt = await dns.resolveTxt(host);
        console.log("TXT OK", txt.flat().join(" | "));
    } catch (e) {
        console.log("TXT fallo:", e.code, e.message);
    }
    try {
        const a = await dns.lookup(host, { all: true });
        console.log("lookup", a);
    } catch (e) {
        console.log("lookup fallo:", e.code, e.message);
    }
}

await probar("sistema");
await probar("google", ["8.8.8.8", "1.1.1.1"]);
