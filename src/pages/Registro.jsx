import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useSesion } from '../context/sesion';

const VIGENCIA_ABIERTA_MS = 10 * 60 * 1000;

function tiempoRestante(abiertoEn) {
  if (!abiertoEn) return null;

  const restante = new Date(abiertoEn).getTime() + VIGENCIA_ABIERTA_MS - Date.now();

  if (restante <= 0) return '0:00';

  const minutos = Math.floor(restante / 60000);
  const segundos = Math.floor((restante % 60000) / 1000);

  return `${minutos}:${segundos.toString().padStart(2, '0')}`;
}

export default function Registro() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, cargando: cargandoSesion } = useSesion();

  const token = location.hash ? location.hash.slice(1) : '';

  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [acepto, setAcepto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [validando, setValidando] = useState(Boolean(token));
  const [invitacion, setInvitacion] = useState(null);
  const [restante, setRestante] = useState(null);

  useEffect(() => {
    if (!cargandoSesion && usuario) {
      navigate(usuario.rol === 'docente' ? '/espacio/maestro/aprender' : '/');
    }
  }, [usuario, cargandoSesion, navigate]);

  useEffect(() => {
    if (!token) return undefined;

    let cancelado = false;

    api(`/usuarios/invitacion/${token}`)
      .then((datos) => {
        if (cancelado) return;

        setInvitacion(datos);
        setRestante(tiempoRestante(datos.abiertoEn));
        setValidando(false);
      })
      .catch((err) => {
        if (cancelado) return;

        setError(err.message || 'El enlace no es válido.');
        setValidando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [token]);

  useEffect(() => {
    if (!invitacion?.abiertoEn) return undefined;

    const id = setInterval(() => {
      setRestante(tiempoRestante(invitacion.abiertoEn));
    }, 1000);

    return () => clearInterval(id);
  }, [invitacion]);

  if (cargandoSesion || validando) {
    return (
      <main className="panel acceso-caja">
        <p className="suave-txt">Verificando tu invitación...</p>
      </main>
    );
  }

  if (!token || error) {
    return (
      <main className="panel acceso-caja">
        <h1>Enlace inválido</h1>
        <p className="suave-txt">{error || 'El enlace no tiene un token de invitación. Pídele uno al administrador.'}</p>
      </main>
    );
  }

  const enviar = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('Escribe tu nombre completo.');
      return;
    }

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!acepto) {
      setError('Debes aceptar la política de tratamiento de datos.');
      return;
    }

    try {
      setEnviando(true);

      await api('/usuarios/registrar-docente', {
        metodo: 'POST',
        cuerpo: {
          token,
          nombre: nombre.trim(),
          contrasena,
          aceptarPolitica: true
        }
      });

      navigate('/espacio/maestro/aprender');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="panel acceso-caja">
      <h1>Completa tu registro</h1>
      <p className="suave-txt">
        Estás aceptando la invitación para ser docente en EDUCALC XE.
      </p>

      {restante && (
        <p className="aviso-caja" role="status">
          Completa el registro en <strong>{restante}</strong> para que el enlace no venza.
        </p>
      )}

      {error && (
        <div className="aviso-caja" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={enviar}>
        <label htmlFor="reg-nombre">
          <strong>Nombre completo</strong>
        </label>
        <input
          id="reg-nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          autoComplete="name"
        />

        <label htmlFor="reg-contrasena">
          <strong>Contraseña</strong>
        </label>
        <input
          id="reg-contrasena"
          type="password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="Mínimo 10 caracteres"
          autoComplete="new-password"
        />

        <label htmlFor="reg-confirmar">
          <strong>Confirmar contraseña</strong>
        </label>
        <input
          id="reg-confirmar"
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="Repite la contraseña"
          autoComplete="new-password"
        />

        <label className="opcion">
          <input
            type="checkbox"
            checked={acepto}
            onChange={(e) => setAcepto(e.target.checked)}
          />
          Acepto la política de tratamiento de datos (Ley 1581 de 2012).
        </label>

        <button
          type="submit"
          className="pnl-btn pnl-btn-primario"
          disabled={enviando}
        >
          {enviando ? 'Activando cuenta...' : 'Activar cuenta'}
        </button>
      </form>
    </main>
  );
}
