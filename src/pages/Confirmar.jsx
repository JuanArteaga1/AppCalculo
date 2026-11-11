import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { alerta, alertaError } from '../services/alertas';
import { api } from '../services/api';

/** El token viene después de # en el enlace del correo: así nunca llega a un servidor ni a sus registros. */
const leerToken = () => window.location.hash.slice(1);

/**
 * Confirmación del correo del estudiante (spec-login CA-15 y CA-16).
 * Si el enlace venció o ya se usó, permite pedir otro con el correo.
 */
export default function Confirmar() {
  const [token] = useState(leerToken);
  const [estado, setEstado] = useState(token ? 'confirmando' : 'error');
  const [mensaje, setMensaje] = useState(token ? '' : 'El enlace está incompleto. Pide otro con tu correo.');
  const [correo, setCorreo] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) return undefined;

    // Quita el token de la barra de direcciones y del historial.
    window.history.replaceState(null, '', window.location.pathname);

    let vigente = true;

    api('/usuarios/confirmar', { metodo: 'POST', cuerpo: { token } })
      .then((respuesta) => {
        if (!vigente) return;
        setMensaje(respuesta.mensaje);
        setEstado('ok');
      })
      .catch((error) => {
        if (!vigente) return;
        setMensaje(error.message);
        setEstado('error');
      });

    return () => {
      vigente = false;
    };
  }, [token]);

  const pedirOtro = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const respuesta = await api('/usuarios/reenviar-confirmacion', { metodo: 'POST', cuerpo: { correo } });
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
          <span className="acceso-eyebrow">Plataforma Educativa Universitaria</span>
          <h1>Confirma tu correo</h1>
          <p>Con tu correo confirmado, tu cuenta de estudiante queda activa.</p>
        </div>
      </aside>

      <section className="acceso-der">
        {estado === 'confirmando' && (
          <div className="acceso-form" role="status">
            <h2>Confirmando tu correo...</h2>
          </div>
        )}

        {estado === 'ok' && (
          <div className="acceso-form" role="status">
            <h2>¡Listo!</h2>
            <p className="suave-txt">{mensaje}</p>
            <Link className="pnl-btn pnl-btn-primario" to="/acceso">Iniciar sesión</Link>
          </div>
        )}

        {estado === 'error' && (
          <form className="acceso-form" onSubmit={pedirOtro}>
            <h2>No pudimos confirmar tu correo</h2>
            <p className="suave-txt">{mensaje}</p>

            <div className="campo">
              <label htmlFor="correo-confirmar">Correo institucional</label>
              <input
                id="correo-confirmar"
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
              <span>¿Ya confirmaste tu correo?</span>
              <Link to="/acceso">Inicia sesión</Link>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
