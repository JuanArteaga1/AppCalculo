import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { alerta, alertaError } from '../services/alertas';
import { api } from '../services/api';
import CampoContrasena from '../components/auth/CampoContrasena';

/** El token va después de # en el enlace del correo: así nunca llega a un servidor ni a sus registros. */
const leerToken = () => window.location.hash.slice(1);

const EXPIRADO = 'El enlace expiró, solicita uno nuevo.';

const msHasta = (fecha) => Math.max(0, new Date(fecha).getTime() - Date.now());

const formatoReloj = (ms) => {
  const minutos = Math.floor(ms / 60000);
  const segundos = Math.floor((ms % 60000) / 1000);
  return `${minutos}:${String(segundos).padStart(2, '0')}`;
};

/**
 * Cambiar la contraseña desde el enlace del correo (spec-recuperar-acceso):
 * sirve 10 minutos desde el primer clic; si expiró, se pide otro aquí mismo.
 */
export default function Recuperar() {
  const navigate = useNavigate();

  const [token] = useState(leerToken);
  const [estado, setEstado] = useState(token ? 'validando' : 'expirado');
  const [motivo, setMotivo] = useState(token ? '' : EXPIRADO);
  const [cierre, setCierre] = useState(null);
  const [restante, setRestante] = useState(null);
  const [datos, setDatos] = useState({ contrasena: '', confirmar: '' });
  const [noCoinciden, setNoCoinciden] = useState(false);
  const [correo, setCorreo] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) return undefined;

    let vigente = true;

    api('/usuarios/recuperar', { metodo: 'POST', cuerpo: { token } })
      .then((respuesta) => {
        if (!vigente) return;
        setCierre(respuesta.cierre);
        setRestante(msHasta(respuesta.cierre));
        setEstado('listo');
      })
      .catch((error) => {
        if (!vigente) return;
        setMotivo(error.message || EXPIRADO);
        setEstado('expirado');
      });

    return () => {
      vigente = false;
    };
  }, [token]);

  // Un enlace nuevo abierto en esta misma pestaña solo cambia el #: se recarga para leerlo.
  useEffect(() => {
    const recargar = () => window.location.reload();
    window.addEventListener('hashchange', recargar);
    return () => window.removeEventListener('hashchange', recargar);
  }, []);

  useEffect(() => {
    if (!cierre) return undefined;

    const reloj = setInterval(() => setRestante(msHasta(cierre)), 1000);
    return () => clearInterval(reloj);
  }, [cierre]);

  const vencido = estado === 'listo' && restante === 0;

  const campo = (nombre) => (e) => {
    setDatos((actual) => ({ ...actual, [nombre]: e.target.value }));
    setNoCoinciden(false);
  };

  const cambiar = async (e) => {
    e.preventDefault();

    // CA-07: si no coinciden, no se envía nada.
    if (datos.contrasena !== datos.confirmar) {
      setNoCoinciden(true);
      alerta.aviso('Revisa tu contraseña', 'Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await api('/usuarios/restablecer', {
        metodo: 'POST',
        cuerpo: { token, contrasena: datos.contrasena },
      });

      // El enlace ya se usó: se quita de la dirección y del historial.
      window.history.replaceState(null, '', window.location.pathname);
      alerta.ok('Contraseña cambiada', respuesta.mensaje);
      navigate('/acceso', { replace: true });
    } catch (error) {
      if (error.codigo === 'ENLACE_EXPIRADO') {
        setMotivo(error.message);
        setEstado('expirado');
      }
      alertaError('No se pudo cambiar la contraseña', error);
    } finally {
      setEnviando(false);
    }
  };

  const pedirOtro = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const respuesta = await api('/usuarios/recuperar-enlace', { metodo: 'POST', cuerpo: { correo } });
      alerta.ok('Revisa tu correo', respuesta.mensaje);
    } catch (error) {
      alertaError('No se pudo pedir otro enlace', error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="acceso">
      <aside className="acceso-izq">
        <div className="acceso-caja">
          <div className="acceso-logo">
            <img src="/LogoUniversidad.png" alt="Logo de la Universidad Autónoma" />
          </div>
          <span className="acceso-eyebrow">Recuperar acceso</span>
          <h1>Crea una contraseña nueva</h1>
          <p>Al cambiarla se cierran las sesiones que tengas abiertas en otros equipos.</p>
        </div>
      </aside>

      <section className="acceso-der">
        {estado === 'validando' && (
          <div className="acceso-form" role="status">
            <h2>Verificando tu enlace...</h2>
          </div>
        )}

        {(estado === 'expirado' || vencido) && (
          <form className="acceso-form" onSubmit={pedirOtro}>
            <h2>El enlace expiró</h2>
            <p className="suave-txt">
              {vencido ? EXPIRADO : motivo || EXPIRADO} Escribe tu correo y te enviamos otro.
            </p>

            <div className="campo">
              <label htmlFor="rec-correo">Correo institucional</label>
              <input
                id="rec-correo"
                type="email"
                placeholder="nombre.apellido@uniautonoma.edu.co"
                autoComplete="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <button className="pnl-btn pnl-btn-primario" type="submit" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviarme otro enlace'}
            </button>

            <div className="acceso-abajo">
              <span>¿Ya la recordaste?</span>
              <Link to="/acceso">Inicia sesión</Link>
            </div>
          </form>
        )}

        {estado === 'listo' && !vencido && (
          <form className="acceso-form" onSubmit={cambiar}>
            <h2>Cambia tu contraseña</h2>

            <div className="aviso-caja" role="timer" aria-live="off">
              Tienes <b>{formatoReloj(restante ?? 0)}</b> para cambiarla.
            </div>

            <div className="campo">
              <label htmlFor="rec-contrasena">Nueva contraseña</label>
              <CampoContrasena
                id="rec-contrasena"
                                placeholder="Mínimo 10 caracteres"
                autoComplete="new-password"
                minLength={10}
                value={datos.contrasena}
                onChange={campo('contrasena')}
                required
              />
              <span className="campo-ayuda">Mínimo 10 caracteres. Una frase fácil de recordar sirve.</span>
            </div>

            <div className="campo">
              <label htmlFor="rec-confirmar">Confirmar nueva contraseña</label>
              <CampoContrasena
                id="rec-confirmar"
                                placeholder="Repite la contraseña"
                autoComplete="new-password"
                value={datos.confirmar}
                onChange={campo('confirmar')}
                aria-invalid={noCoinciden || undefined}
                aria-describedby={noCoinciden ? 'rec-error' : undefined}
                required
              />
              {noCoinciden && <span id="rec-error" className="campo-error">Las contraseñas no coinciden.</span>}
            </div>

            <button className="pnl-btn pnl-btn-primario" type="submit" disabled={enviando}>
              {enviando ? 'Cambiando...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
