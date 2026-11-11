import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { destinoAlIngresar, useSesion } from '../context/sesion';
import { alerta, alertaError } from '../services/alertas';
import { api } from '../services/api';

// Tras abrir el enlace por primera vez, hay 10 minutos para registrarse (spec-login BR-01).
const VIGENCIA_ABIERTA_MS = 10 * 60 * 1000;

/** Milisegundos que quedan para completar el registro. */
const msRestantes = (abiertoEn) =>
  Math.max(0, new Date(abiertoEn).getTime() + VIGENCIA_ABIERTA_MS - Date.now());

const formatoReloj = (ms) => {
  const minutos = Math.floor(ms / 60000);
  const segundos = Math.floor((ms % 60000) / 1000);
  return `${minutos}:${String(segundos).padStart(2, '0')}`;
};

/** El token va después de # en el enlace del correo: así nunca llega a un servidor. */
const leerToken = () => window.location.hash.slice(1);

/**
 * Registro del docente desde su invitación (spec-login RF-02, RF-03, CA-03 y CA-07).
 * El correo viene fijo de la invitación y no se cambia.
 */
export default function Registro() {
  const { usuario, entrar } = useSesion();

  const [token] = useState(leerToken);
  const [estado, setEstado] = useState(token ? 'validando' : 'invalido');
  const [motivo, setMotivo] = useState('');
  const [invitacion, setInvitacion] = useState(null);
  const [restante, setRestante] = useState(null);
  const [datos, setDatos] = useState({ nombre: '', contrasena: '', confirmar: '', acepto: false });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) return undefined;

    let vigente = true;

    api('/usuarios/invitacion', { metodo: 'POST', cuerpo: { token } })
      .then((respuesta) => {
        if (!vigente) return;
        setInvitacion(respuesta);
        setRestante(msRestantes(respuesta.abiertoEn));
        setEstado('listo');
      })
      .catch((error) => {
        if (!vigente) return;
        setMotivo(error.message);
        setEstado('invalido');
      });

    return () => {
      vigente = false;
    };
  }, [token]);

  useEffect(() => {
    if (!invitacion) return undefined;

    const reloj = setInterval(() => setRestante(msRestantes(invitacion.abiertoEn)), 1000);
    return () => clearInterval(reloj);
  }, [invitacion]);

  // Con sesión (también justo después de registrarse): a su espacio.
  if (usuario) return <Navigate to={destinoAlIngresar(usuario.rol)} replace />;

  const campo = (nombre) => (e) =>
    setDatos((actual) => ({ ...actual, [nombre]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();

    if (!datos.nombre.trim()) {
      alerta.aviso('Revisa tus datos', 'Escribe tu nombre completo.');
      return;
    }

    if (datos.contrasena !== datos.confirmar) {
      alerta.aviso('Revisa tus datos', 'Las contraseñas no coinciden.');
      return;
    }

    if (!datos.acepto) {
      alerta.aviso('Revisa tus datos', 'Debes aceptar la política de tratamiento de datos.');
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await api('/usuarios/registrar-docente', {
        metodo: 'POST',
        cuerpo: { token, nombre: datos.nombre.trim(), contrasena: datos.contrasena, aceptarPolitica: true },
      });

      alerta.ok('¡Bienvenido a EDUCALC XE!', 'Tu cuenta de docente quedó activa.');
      // Con la sesión puesta, el render lleva a su espacio.
      entrar(respuesta.usuario);
    } catch (error) {
      alertaError('No se pudo completar el registro', error);
    } finally {
      setEnviando(false);
    }
  };

  const vencido = estado === 'listo' && restante === 0;

  return (
    <div className="acceso">
      <aside className="acceso-izq">
        <div className="acceso-caja">
          <div className="acceso-logo">
            <img src="/LogoUniversidad.png" alt="Logo de la Universidad Autónoma" />
          </div>
          <span className="acceso-eyebrow">Invitación para docentes</span>
          <h1>Bienvenido a EDUCALC XE</h1>
          <p>
            Completa tu registro para crear quices, seguir a tus estudiantes y
            compartir material en los módulos del curso.
          </p>
        </div>
      </aside>

      <section className="acceso-der">
        {estado === 'validando' && (
          <div className="acceso-form" role="status">
            <h2>Verificando tu invitación...</h2>
          </div>
        )}

        {(estado === 'invalido' || vencido) && (
          <div className="acceso-form" role="alert">
            <h2>Este enlace ya no sirve</h2>
            <p className="suave-txt">
              {vencido
                ? 'Pasaron más de 10 minutos desde que abriste el enlace. Pídele al administrador que te envíe una invitación nueva.'
                : motivo || 'El enlace está incompleto. Pídele al administrador que te envíe una invitación nueva.'}
            </p>
            <Link className="pnl-btn pnl-btn-secundario" to="/acceso">Ir a iniciar sesión</Link>
          </div>
        )}

        {estado === 'listo' && !vencido && (
          <form className="acceso-form" onSubmit={enviar}>
            <h2>Completa tu registro</h2>
            <p className="suave-txt">Estás aceptando la invitación para ser docente.</p>

            <div className="aviso-caja" role="timer" aria-live="off">
              Tienes <b>{formatoReloj(restante ?? 0)}</b> para completar el registro.
            </div>

            <div className="campo">
              <label htmlFor="reg-correo">Correo institucional</label>
              <input id="reg-correo" type="email" value={invitacion.correo} readOnly aria-readonly="true" />
              <span className="campo-ayuda">Es el correo de la invitación y no se puede cambiar.</span>
            </div>

            <div className="campo">
              <label htmlFor="reg-nombre">Nombre completo</label>
              <input
                id="reg-nombre"
                type="text"
                placeholder="Andrés Ruiz"
                autoComplete="name"
                maxLength={120}
                value={datos.nombre}
                onChange={campo('nombre')}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="reg-contrasena">Contraseña</label>
              <input
                id="reg-contrasena"
                type="password"
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
              <label htmlFor="reg-confirmar">Confirma la contraseña</label>
              <input
                id="reg-confirmar"
                type="password"
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                value={datos.confirmar}
                onChange={campo('confirmar')}
                required
              />
            </div>

            <label className="acepto" htmlFor="reg-acepto">
              <input id="reg-acepto" type="checkbox" checked={datos.acepto} onChange={campo('acepto')} />
              <span>Acepto la política de tratamiento de datos personales (Ley 1581 de 2012).</span>
            </label>

            <button className="pnl-btn pnl-btn-primario" type="submit" disabled={enviando}>
              {enviando ? 'Activando cuenta...' : 'Activar mi cuenta'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
