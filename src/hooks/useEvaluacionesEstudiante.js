import { useEffect, useState } from 'react';
import { api } from '../services/api';

/**
 * Carga las evaluaciones que el estudiante ha abierto.
 * El backend solo expone evaluate con registro en respuestasQuiz.
 * Se cargan una sola vez al montar el componente.
 * @param {{rol?: string}} opciones
 */
export function useEvaluacionesEstudiante({ rol } = {}) {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(rol === 'estudiante');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (rol !== 'estudiante') {
      return undefined;
    }

    let cancelado = false;

    async function cargar() {
      try {
        const datos = await api('/evaluaciones/estudiante');
        if (!cancelado) {
          setEvaluaciones(datos.evaluaciones ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.mensaje ?? 'No se pudieron cargar tus evaluaciones.');
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, [rol]);

  return { evaluaciones, cargando, error };
}
