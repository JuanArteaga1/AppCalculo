import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { SesionContext } from './sesion';

/**
 * Conoce al usuario actual preguntándole al backend: la sesión vive en una
 * cookie httpOnly que el JavaScript no puede leer. Esto solo sirve para mostrar
 * la pantalla correcta; los permisos reales los valida el servidor.
 */
export default function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;

    api('/usuarios/me')
      .then((datos) => {
        if (vigente) setUsuario(datos.usuario);
      })
      .catch(() => {
        if (vigente) setUsuario(null);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  const salir = useCallback(async () => {
    try {
      await api('/usuarios/logout', { metodo: 'POST' });
    } finally {
      setUsuario(null);
    }
  }, []);

  const valor = useMemo(() => ({ usuario, cargando, entrar: setUsuario, salir }), [usuario, cargando, salir]);

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}
