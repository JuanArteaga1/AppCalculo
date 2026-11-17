import { useState } from 'react';
import { api } from '../../services/api';
import { alerta, alertaError } from '../../services/alertas';
import CampoContrasena from './CampoContrasena';

export default function FormularioLogin({
  alEntrar,
  alError,
  alRecuperar,
  alRegistro,
}) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [pendiente, setPendiente] = useState('');

  const enviar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setPendiente('');

    try {
      const respuesta = await api('/usuarios/login', {
        metodo: 'POST',
        cuerpo: { correo, contrasena },
      });
      alEntrar(respuesta);
    } catch (error) {
      if (error.codigo === 'CUENTA_PENDIENTE') setPendiente(correo);
      alError?.(error);
      alertaError('No se pudo ingresar', error);
    } finally {
      setCargando(false);
    }
  };

  const reenviarEnlace = async (direccion) => {
    setCargando(true);

    try {
      const respuesta = await api('/usuarios/reenviar-confirmacion', {
        metodo: 'POST',
        cuerpo: { correo: direccion },
      });
      alerta.ok('Revisa tu correo', respuesta.mensaje);
    } catch (error) {
      alertaError('No se pudo enviar otro enlace', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="acceso-form" onSubmit={enviar}>
      <h2>Inicia sesión</h2>
      <p className="suave-txt">Usa el correo institucional que te dio la universidad.</p>

      <div className="campo">
        <label htmlFor="correo">Correo institucional</label>
        <input
          id="correo"
          type="email"
          placeholder="nombre.apellido@uniautonoma.edu.co"
          autoComplete="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="clave">Contraseña</label>
        <CampoContrasena
          id="clave"
                    placeholder="••••••••"
          autoComplete="current-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
      </div>

      <button
        className="pnl-btn pnl-btn-primario"
        type="submit"
        disabled={cargando}
      >
        {cargando ? 'Ingresando...' : 'Entrar'}
      </button>

      {pendiente && (
        <div className="aviso-caja" role="status">
          <b>Tu cuenta aún no está confirmada.</b>
          <p>Abre el enlace que te enviamos a {pendiente}. Si no te llegó, te mandamos otro.</p>
          <button
            type="button"
            className="pnl-btn pnl-btn-secundario pnl-btn-chico"
            onClick={() => reenviarEnlace(pendiente)}
            disabled={cargando}
          >
            Enviarme otro enlace
          </button>
        </div>
      )}

      <div className="acceso-abajo">
        <span>¿Olvidaste tu contraseña?</span>
        <button type="button" onClick={alRecuperar}>Recuperar acceso</button>
      </div>
      <div className="acceso-abajo" style={{ borderTop: 0, paddingTop: 0 }}>
        <span>¿Primera vez en la plataforma?</span>
        <button type="button" onClick={alRegistro}>Crear cuenta</button>
      </div>
    </form>
  );
}
