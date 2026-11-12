import { useCallback, useEffect, useState } from 'react';
import { obtenerCurso, obtenerTema } from '../services/temasService';

/** El curso llega de la API; sin respaldo local no hay contenido que mostrar si falla. */
export function useCurso() {
  const [curso, setCurso] = useState({ modulos: [] });
  const [estado, setEstado] = useState('cargando');
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;

    obtenerCurso()
      .then((datos) => {
        if (!vigente) return;
        setCurso(datos);
        setError(null);
        setEstado('listo');
      })
      .catch((fallo) => {
        if (!vigente) return;
        setError(fallo);
        setEstado('error');
      });

    return () => {
      vigente = false;
    };
  }, [intento]);

  const reintentar = useCallback(() => {
    setError(null);
    setEstado('cargando');
    setIntento((n) => n + 1);
  }, []);

  return { ...curso, estado, error, reintentar };
}

/**
 * Distingue tres finales: `listo` con tema, `listo` con tema null (404) y
 * `error` (el servidor no respondió). Solo el 404 se muestra como no encontrado.
 */
export function useTema(modulo, numero) {
  const clave = `${modulo}/${numero}`;
  const [resultado, setResultado] = useState({
    clave: null,
    tema: null,
    estado: 'cargando',
    error: null,
  });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;

    obtenerTema(modulo, numero)
      .then((tema) => {
        if (!vigente) return;
        setResultado({ clave, tema, estado: 'listo', error: null });
      })
      .catch((error) => {
        if (!vigente) return;
        setResultado({ clave, tema: null, estado: 'error', error });
      });

    return () => {
      vigente = false;
    };
  }, [clave, modulo, numero, intento]);

  const reintentar = useCallback(() => {
    setResultado((previo) => ({ ...previo, estado: 'cargando', error: null }));
    setIntento((n) => n + 1);
  }, []);

  return resultado.clave === clave
    ? { tema: resultado.tema, estado: resultado.estado, error: resultado.error, reintentar }
    : { tema: null, estado: 'cargando', error: null, reintentar };
}
