import { sileo } from 'sileo';

/** Segundos en pantalla: un error necesita más tiempo de lectura que un éxito. */
const DURACION = { ok: 5000, info: 5000, aviso: 8000, error: 10000, deshacer: 10000 };

/** Sileo encoge la alerta a los 4 s sea cual sea su duración: así la descripción dura lo mismo. */
const opciones = (titulo, descripcion, duracion) => ({
  title: titulo,
  description: descripcion,
  duration: duracion,
  autopilot: { collapse: duracion - 1000 },
});

/**
 * Todas las alertas de la app pasan por aquí, para que se vean y duren igual.
 * Requiere el <Toaster> montado en App.jsx. Sileo muestra una a la vez.
 */
export const alerta = {
  ok: (titulo, descripcion) => sileo.success(opciones(titulo, descripcion, DURACION.ok)),
  info: (titulo, descripcion) => sileo.info(opciones(titulo, descripcion, DURACION.info)),
  aviso: (titulo, descripcion) => sileo.warning(opciones(titulo, descripcion, DURACION.aviso)),
  error: (titulo, descripcion) => sileo.error(opciones(titulo, descripcion, DURACION.error)),
};

/** Alerta para un fallo de la API: el título dice qué falló y la descripción, por qué. */
export const alertaError = (titulo, error) => alerta.error(titulo, error?.message);

/** Alerta con un botón para revertir la acción. Devuelve su id, para cerrarla con cerrarAlerta. */
export const alertaDeshacer = (titulo, descripcion, deshacer) => {
  const id = sileo.info({
    ...opciones(titulo, descripcion, DURACION.deshacer),
    button: {
      title: 'Deshacer',
      onClick: () => {
        sileo.dismiss(id);
        deshacer();
      },
    },
  });

  return id;
};

export const cerrarAlerta = (id) => sileo.dismiss(id);
