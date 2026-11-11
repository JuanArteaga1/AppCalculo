/**
 * Reglas de contraseña (spec-login BR-05): largo mínimo y sin las más comunes.
 * Sin exigir mayúsculas ni símbolos: las guías actuales prefieren el largo.
 */
export const LARGO_MINIMO = 10;

// Las más usadas en listas públicas de filtraciones, más variantes locales.
const COMUNES = new Set([
    "1234567890", "0123456789", "12345678910", "1111111111", "0000000000",
    "qwertyuiop", "asdfghjkl1", "1q2w3e4r5t", "qwerty1234", "contrasena",
    "contraseña", "contrasena1", "contraseña1", "contrasena123", "contraseña123",
    "password12", "password123", "password1234", "passw0rd123", "iloveyou12",
    "uniautonoma", "uniautonoma1", "uniautonoma123", "autonoma123", "colombia123",
    "colombia2024", "colombia2025", "colombia2026", "popayan123", "estudiante1",
    "estudiante123", "docente123", "profesor123", "administrador", "admin12345",
    "calculo123", "matematicas", "bienvenido1", "bienvenido123", "teamo12345",
]);

/** Devuelve el motivo por el que se rechaza, o null si la contraseña sirve. */
export function motivoContrasenaInvalida(clave) {
    if (typeof clave !== "string" || clave.length < LARGO_MINIMO) {
        return `La contraseña debe tener al menos ${LARGO_MINIMO} caracteres.`;
    }

    if (COMUNES.has(clave.toLowerCase())) {
        return "Esa contraseña es demasiado común. Elige otra.";
    }

    return null;
}
