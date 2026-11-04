/**
 * Contrato de errores de la API. Toda petición recibe una respuesta con el
 * código HTTP correcto:
 *
 *  - Error del usuario (4xx): JSON { error, descripcion }. `error` es un código
 *    estable para el programa y `descripcion` es el texto que ve la persona.
 *  - Error de sistema (5xx): solo el código HTTP, sin cuerpo. El detalle queda
 *    en el registro del servidor; nunca llega al navegador.
 */
export function errorCliente(res, estado, error, descripcion) {
    return res.status(estado).json({ error, descripcion });
}

export function errorSistema(res, contexto, causa) {
    console.error(`[${contexto}]`, causa?.message ?? causa);
    return res.status(500).end();
}
