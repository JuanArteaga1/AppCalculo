import { useState } from 'react';
import { api } from '../../services/api';
import { alerta, alertaError } from '../../services/alertas';

export default function FormularioRecuperar({ alEnviado, alError, alLogin }) {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState('');

  const enviar = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const respuesta = await api('/usuarios/recuperar-enlace', {
        metodo: 'POST',
        cuerpo: { correo },
      });
      setEnviado(respuesta.mensaje);
      alEnviado?.(respuesta.mensaje);
      alerta.ok('Revisa tu correo', respuesta.mensaje);
    } catch (error) {
      alError?.(error);
      alertaError('No se pudo enviar el enlace', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form className="acceso-form" onSubmit={enviar}>
      <h2>Recuperar acceso</h2>
      <p className="suave-txt">
        Escribe tu correo institucional y te enviamos un enlace para crear una contraseña nueva.
        Vence a las 72 horas, y una vez lo abras tienes 10 minutos para usarlo.
      </p>

      <div className="campo">
        <label htmlFor="correo-rec">Correo institucional</label>
        <input
          id="correo-rec"
          type="email"
          placeholder="nombre.apellido@uniautonoma.edu.co"
          autoComplete="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
      </div>

      <button className="pnl-btn pnl-btn-primario" type="submit" disabled={cargando}>
        {cargando ? 'Enviando...' : 'Enviar enlace'}
      </button>

      {enviado && (
        <div className="aviso-caja" role="status">
          {enviado}
        </div>
      )}

      <div className="acceso-abajo">
        <span>¿Ya la recordaste?</span>
        <button type="button" onClick={alLogin}>Volver a iniciar sesión</button>
      </div>
    </form>
  );
}
