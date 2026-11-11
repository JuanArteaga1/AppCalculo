import "dotenv/config";
import { enviarEnlace } from "../lib/correo.js";

const destinatario = process.argv[2];

if (!destinatario) {
    console.error("Uso: node scripts/probarCorreo.js <correo@uniautonoma.edu.co>");
    process.exit(1);
}

console.log("Configuración detectada:");
console.log("  SMTP_HOST:", process.env.SMTP_HOST ? "sí" : "no");
console.log("  SMTP_PORT:", process.env.SMTP_PORT ?? "no");
console.log("  SMTP_USER:", process.env.SMTP_USER ? "sí" : "no");
console.log("  SMTP_PASS:", process.env.SMTP_PASS ? "sí" : "no");
console.log("  URL_APP:", process.env.URL_APP ? "sí" : "no");
console.log("");

const resultado = await enviarEnlace("invitacion", destinatario, "token-de-prueba");

if (resultado.enviado) {
    console.log("✅ Correo enviado correctamente a", destinatario);
    console.log("Enlace:", resultado.enlace);
} else {
    console.error("❌ No se pudo enviar el correo.");
    console.error("Error:", resultado.error ?? "desconocido");
    console.error("Revisa SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y URL_APP en el .env");
    console.log("Enlace de respaldo:", resultado.enlace);
    process.exit(1);
}
