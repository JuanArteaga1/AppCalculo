import { test } from "node:test";
import assert from "node:assert/strict";
import { LARGO_MINIMO, motivoContrasenaInvalida } from "../lib/contrasenas.js";

// spec-login CA-09 (reglas): el registro y el cambio de contraseña usarán esta función.
test("CA-09: rechaza contraseñas cortas o comunes y acepta una larga", () => {
    assert.equal(LARGO_MINIMO, 10);
    assert.match(motivoContrasenaInvalida("corta123"), /al menos 10/);
    assert.match(motivoContrasenaInvalida(""), /al menos 10/);
    assert.match(motivoContrasenaInvalida(undefined), /al menos 10/);
    assert.match(motivoContrasenaInvalida("1234567890"), /común/);
    assert.match(motivoContrasenaInvalida("Contrasena123"), /común/);
    assert.equal(motivoContrasenaInvalida("una frase larga sin simbolos"), null);
    assert.equal(motivoContrasenaInvalida("minusculasperolargas"), null);
});
