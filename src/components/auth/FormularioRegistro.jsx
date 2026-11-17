import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { alerta, alertaError } from '../../services/alertas';
import CampoContrasena from './CampoContrasena';

export default function FormularioRegistro({ alRegistrado, alError, alLogin }) {
  const [registro, setRegistro] = useState({
    nombre: '',
    correo: '',
    carrera: '',
    contrasena: '',
    acepto: false,
  });
  const [carreras, setCarreras] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [registrado, setRegistrado] = useState('');

  useEffect(() => {
    if (carreras) return undefined;

    let vigente = true;

    api('/usuarios/carreras')
      .then((datos) => {
        if (vigente) setCarreras(datos);
      })
      .catch((error) => {
        if (vigente) alertaError('No se pudo cargar la lista de carreras', error);
      });

    return () => {
      vigente = false;
    };
  }, [carreras]);

  const cambiar = (campo) => (e) =>
    setRegistro((actual) => ({
      ...actual,
      [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

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

  const enviar = async (e) => {
    e.preventDefault();

    if (!registro.carrera) {
      alerta.aviso('Revisa tus datos', 'Elige tu carrera de la lista.');
      return;
    }

    if (!registro.acepto) {
      alerta.aviso('Revisa tus datos', 'Debes aceptar la política de tratamiento de datos.');
      return;
    }

    setCargando(true);

    try {
      const respuesta = await api('/usuarios/registro', {
        metodo: 'POST',
        cuerpo: {
          nombre: registro.nombre,
          correo: registro.correo,
          carrera: registro.carrera,
          contrasena: registro.contrasena,
          aceptarPolitica: true,
        },
      });

      setRegistrado(respuesta.mensaje);
      alRegistrado?.(respuesta.mensaje, registro.correo);
    } catch (error) {
      alError?.(error);
      alertaError('No se pudo crear la cuenta', error);
    } finally {
      setCargando(false);
    }
  };

  if (registrado) {
    return (
      <div className="acceso-form" role="status">
        <h2>Revisa tu correo</h2>
        <p className="suave-txt">{registrado}</p>
        <p className="suave-txt">
          El enlace vence en 24 horas. Hasta que lo abras, tu cuenta queda pendiente y no puedes ingresar.
        </p>

        <button
          type="button"
          className="pnl-btn pnl-btn-secundario"
          onClick={() => reenviarEnlace(registro.correo)}
          disabled={cargando}
        >
          Enviarme otro enlace
        </button>

        <div className="acceso-abajo">
          <span>¿Ya confirmaste tu correo?</span>
          <button type="button" onClick={alLogin}>Inicia sesión</button>
        </div>
      </div>
    );
  }

  return (
    <form className="acceso-form" onSubmit={enviar}>
      <h2>Crear cuenta</h2>
      <p className="suave-txt">
        Para estudiantes, con tu correo institucional. Los docentes reciben una invitación del administrador.
      </p>

      <div className="campo">
        <label htmlFor="nombre">Nombre completo</label>
        <input
          id="nombre"
          type="text"
          placeholder="María Benavidez"
          autoComplete="name"
          minLength={3}
          maxLength={120}
          value={registro.nombre}
          onChange={cambiar('nombre')}
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="correo-reg">Correo institucional</label>
        <input
          id="correo-reg"
          type="email"
          placeholder="nombre.apellido@uniautonoma.edu.co"
          autoComplete="email"
          pattern=".+@uniautonoma\\.edu\\.co"
          title="Usa tu correo @uniautonoma.edu.co"
          value={registro.correo}
          onChange={cambiar('correo')}
          required
        />
      </div>

      <div className="campo">
        <label htmlFor="carrera">Carrera</label>
        <select
          id="carrera"
          value={registro.carrera}
          onChange={cambiar('carrera')}
          disabled={!carreras}
          required
        >
          <option value="">{carreras ? 'Elige tu carrera' : 'Cargando carreras...'}</option>
          {carreras && (
            <>
              <optgroup label="Pregrados">
                {carreras.pregrados.map((c) => <option key={c} value={c}>{c}</option>)}
              </optgroup>
              <optgroup label="Especializaciones">
                {carreras.especializaciones.map((c) => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            </>
          )}
        </select>
      </div>

      <div className="campo">
        <label htmlFor="clave-reg">Contraseña</label>
        <CampoContrasena
          id="clave-reg"
                    placeholder="Mínimo 10 caracteres"
          autoComplete="new-password"
          minLength={10}
          value={registro.contrasena}
          onChange={cambiar('contrasena')}
          required
        />
        <span className="campo-ayuda">Mínimo 10 caracteres. Una frase fácil de recordar sirve.</span>
      </div>

      <label className="acepto" htmlFor="acepto">
        <input id="acepto" type="checkbox" checked={registro.acepto} onChange={cambiar('acepto')} />
        <span>Acepto la política de tratamiento de datos personales (Ley 1581 de 2012) para el seguimiento académico del curso.</span>
      </label>

      <button className="pnl-btn pnl-btn-primario" type="submit" disabled={cargando}>
        {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <div className="acceso-abajo">
        <span>¿Ya tienes cuenta?</span>
        <button type="button" onClick={alLogin}>Inicia sesión</button>
      </div>
    </form>
  );
}
