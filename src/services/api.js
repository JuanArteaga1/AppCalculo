export class ErrorApi extends Error {
  constructor(mensaje, estado, codigo) {
    super(mensaje);
    this.estado = estado;
    this.codigo = codigo;
  }
}

const SIN_SERVIDOR = 'No se pudo conectar con el servidor.';
const ERROR_SISTEMA = 'Ocurrió un problema en el servidor. Intenta de nuevo en unos minutos.';

/**
 * Todas las llamadas al backend pasan por aquí. La ruta es relativa (/api/...):
 * en local la redirige Vite y en producción Vercel, así la cookie de sesión
 * siempre es del mismo dominio.
 */
export async function api(ruta, { metodo = 'GET', cuerpo, archivo } = {}) {
  const opciones = { method: metodo, credentials: 'same-origin' };

  if (archivo) {
    opciones.body = archivo;
  } else if (cuerpo !== undefined) {
    opciones.headers = { 'Content-Type': 'application/json' };
    opciones.body = JSON.stringify(cuerpo);
  }

  let respuesta;

  try {
    respuesta = await fetch(`/api${ruta}`, opciones);
  } catch {
    throw new ErrorApi(SIN_SERVIDOR, 0);
  }

  if (respuesta.status === 204) return null;

  const esJson = (respuesta.headers.get('content-type') ?? '').includes('application/json');

  // Contrato del backend: un error del usuario trae { error, descripcion }; uno
  // de sistema llega solo con el código HTTP, sin detalles.
  if (!respuesta.ok) {
    const { error, descripcion } = esJson ? await respuesta.json() : {};
    throw new ErrorApi(descripcion ?? ERROR_SISTEMA, respuesta.status, error);
  }

  // Sin backend, el hosting responde 200 con la página de la app.
  if (!esJson) throw new ErrorApi(SIN_SERVIDOR, 0);

  return respuesta.json();
}
