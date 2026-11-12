import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { FiShield, FiUser, FiUsers } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { destinoAlIngresar, MODO_DEMO, useSesion } from '../context/sesion';
import { alerta, alertaError } from '../services/alertas';
import { api } from '../services/api';

const ERROR_GOOGLE = {
  ok: 'Ingreso completado. Abriendo tu espacio…',
  'no-configurado': 'Google todavía no está configurado. Falta GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en backend/.env.',
  dominio: 'Solo puedes entrar con tu correo institucional @uniautonoma.edu.co.',
  cancelado: 'Cancelaste el ingreso con Google. Puedes intentarlo de nuevo.',
  inactivo: 'Tu cuenta está inactiva. Comunícate con el administrador.',
  'estado-invalido': 'La sesión de Google venció. Inténtalo de nuevo.',
  error: 'No se pudo completar el ingreso con Google. Inténtalo de nuevo.',
};

/**
 * Pantalla de acceso: ingresar, recuperar contraseña y crear cuenta.
 * Ingresar y crear cuenta (estudiantes, con confirmación por correo) usan el
 * backend; recuperar sigue siendo maqueta (spec-login tarea D).
 */
export default function Acceso() {


  const { usuario, entrar } = useSesion();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [entrandoDemo, setEntrandoDemo] = useState('');
  const [errorDemo, setErrorDemo] = useState('');


  const [params] = useSearchParams();
  const [form, setForm] = useState(params.get('form') === 'registro' ? 'registro' : 'login');
  const [avisoEnviado, setAvisoEnviado] = useState(false);

  const volver = params.get('volver');
  const avisoGoogle = params.get('google')
    ? ERROR_GOOGLE[params.get('google')] ?? ERROR_GOOGLE.error
    : '';
  const enlaceGoogle = `/api/usuarios/google${volver ? `?volver=${encodeURIComponent(volver)}` : ''}`;

  // Registro del estudiante (spec-login RF-01, RF-03 y RF-08).
  const [registro, setRegistro] = useState({ nombre: '', correo: '', carrera: '', contrasena: '', acepto: false });
  const [carreras, setCarreras] = useState(null);
  const [registrado, setRegistrado] = useState('');
  // Correo de una cuenta pendiente de confirmar: ofrece reenviar el enlace.
  const [pendiente, setPendiente] = useState('');

  const cambiar = (cual) => {
    setForm(cual);
    setAvisoEnviado(false);
    setRegistrado('');
  };

  const campoRegistro = (campo) => (e) =>
    setRegistro((actual) => ({ ...actual, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  useEffect(() => {
    if (form !== 'registro' || carreras) return undefined;

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
  }, [form, carreras]);

  const crearCuenta = async (e) => {
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
    } catch (error) {
      alertaError('No se pudo crear la cuenta', error);
    } finally {
      setCargando(false);
    }
  };

  const reenviarEnlace = async (direccion) => {
    setCargando(true);

    try {
      const respuesta = await api('/usuarios/reenviar-confirmacion', { metodo: 'POST', cuerpo: { correo: direccion } });
      alerta.ok('Revisa tu correo', respuesta.mensaje);
    } catch (error) {
      alertaError('No se pudo enviar otro enlace', error);
    } finally {
      setCargando(false);
    }
  };


  /** Atajo de desarrollo: el backend abre sesión con la cuenta prueba.<rol>. */
  const entrarComo = async (rol) => {
    setErrorDemo('');
    setEntrandoDemo(rol);

    try {
      const respuesta = await api('/usuarios/demo', { metodo: 'POST', cuerpo: { rol } });
      entrar(respuesta.usuario);
    } catch (error) {
      setErrorDemo(error?.message ?? 'No se pudo abrir la cuenta de prueba.');
    } finally {
      setEntrandoDemo('');
    }
  };

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setCargando(true);
    setPendiente('');

    try {
      const respuesta = await api('/usuarios/login', {
        metodo: 'POST',
        cuerpo: { correo, contrasena },
      });

      // Con la sesión puesta, el render de abajo lleva a su espacio.
      entrar(respuesta.usuario);
    } catch (error) {
      if (error.codigo === 'CUENTA_PENDIENTE') setPendiente(correo);
      alertaError('No se pudo ingresar', error);
    } finally {
      setCargando(false);
    }
  };

  // Con sesión no hay nada que hacer aquí: a su espacio, o de vuelta si su rol puede ver esa página.
  if (usuario) return <Navigate to={destinoAlIngresar(usuario.rol, params.get('volver'))} replace />;

  return (
    <div className="acceso">
      <aside className="acceso-izq">
        <div className="acceso-caja">
          <div className="acceso-logo">
            <img src="/LogoUniversidad.png" alt="Logo de la Universidad Autónoma" />
          </div>
          <span className="acceso-eyebrow">Plataforma Educativa Universitaria</span>
          <h1>Tu cuenta de EDUCALC XE</h1>
          <p>
            Entra para retomar la lección donde la dejaste, ver tus entregas y
            conservar tu progreso en los tres módulos del curso.
          </p>
        </div>
      </aside>

      <section className="acceso-der">
        {form === 'login' && (
          <form className="acceso-form" onSubmit={iniciarSesion}>
            <h2>Inicia sesión</h2>
            <p className="suave-txt">Usa el correo institucional que te dio la universidad.</p>

            <a className="pnl-btn pnl-btn-google" href={enlaceGoogle}>
              <FcGoogle aria-hidden="true" />
              Continuar con Google
            </a>
            <p className="acceso-nota">
              Solo correos @uniautonoma.edu.co. Al continuar aceptas la política de tratamiento de datos.
            </p>

            {avisoGoogle && (
              <div className="aviso-caja" role="alert">{avisoGoogle}</div>
            )}

            <div className="acceso-separador"><span>o entra con tu contraseña</span></div>

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
              <input
                id="clave"
                type="password"
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
              <button type="button" onClick={() => cambiar('recuperar')}>Recuperar acceso</button>
            </div>
            <div className="acceso-abajo" style={{ borderTop: 0, paddingTop: 0 }}>
              <span>¿Primera vez en la plataforma?</span>
              <button type="button" onClick={() => cambiar('registro')}>Crear cuenta</button>
            </div>

            {MODO_DEMO && (
              <div className="acceso-perfiles">
                <span className="acceso-perfiles-rotulo">Acceso de prueba · sesión automática</span>
                <div className="acceso-perfiles-botones">
                  <button
                    type="button"
                    className="perfil-btn"
                    onClick={() => entrarComo('estudiante')}
                    disabled={Boolean(entrandoDemo)}
                  >
                    <FiUser aria-hidden="true" />
                    {entrandoDemo === 'estudiante' ? 'Entrando…' : 'Estudiante'}
                  </button>
                  <button
                    type="button"
                    className="perfil-btn"
                    onClick={() => entrarComo('docente')}
                    disabled={Boolean(entrandoDemo)}
                  >
                    <FiUsers aria-hidden="true" />
                    {entrandoDemo === 'docente' ? 'Entrando…' : 'Docente'}
                  </button>
                  <button
                    type="button"
                    className="perfil-btn"
                    onClick={() => entrarComo('administrador')}
                    disabled={Boolean(entrandoDemo)}
                  >
                    <FiShield aria-hidden="true" />
                    {entrandoDemo === 'administrador' ? 'Entrando…' : 'Administrador'}
                  </button>
                </div>
                {errorDemo && <div className="aviso-caja" role="alert">{errorDemo}</div>}
                <p className="acceso-nota">
                  Atajos de desarrollo: abren una cuenta de prueba con su rol. Se desactivan en producción.
                </p>
              </div>
            )}
          </form>
        )}

        {form === 'recuperar' && (
          <form
            className="acceso-form"
            onSubmit={(e) => {
              e.preventDefault();
              setAvisoEnviado(true);
            }}
          >
            <h2>Recuperar acceso</h2>
            <p className="suave-txt">Te enviamos un enlace para crear una contraseña nueva.</p>

            <div className="campo">
              <label htmlFor="correo-rec">Correo institucional</label>
              <input id="correo-rec" type="email" placeholder="nombre.apellido@uniautonoma.edu.co" autoComplete="email" />
            </div>

            <button className="pnl-btn pnl-btn-primario" type="submit">Enviar enlace</button>

            {avisoEnviado && (
              <div className="aviso-caja">
                Si el correo está registrado, en unos minutos te llega el enlace.
              </div>
            )}

            <div className="acceso-abajo">
              <span>¿Ya la recordaste?</span>
              <button type="button" onClick={() => cambiar('login')}>Volver a iniciar sesión</button>
            </div>
          </form>
        )}

        {form === 'registro' && registrado && (
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
              <button type="button" onClick={() => cambiar('login')}>Inicia sesión</button>
            </div>
          </div>
        )}

        {form === 'registro' && !registrado && (
          <form className="acceso-form" onSubmit={crearCuenta}>
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
                onChange={campoRegistro('nombre')}
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
                pattern=".+@uniautonoma\.edu\.co"
                title="Usa tu correo @uniautonoma.edu.co"
                value={registro.correo}
                onChange={campoRegistro('correo')}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="carrera">Carrera</label>
              <select
                id="carrera"
                value={registro.carrera}
                onChange={campoRegistro('carrera')}
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
              <input
                id="clave-reg"
                type="password"
                placeholder="Mínimo 10 caracteres"
                autoComplete="new-password"
                minLength={10}
                value={registro.contrasena}
                onChange={campoRegistro('contrasena')}
                required
              />
              <span className="campo-ayuda">Mínimo 10 caracteres. Una frase fácil de recordar sirve.</span>
            </div>

            <label className="acepto" htmlFor="acepto">
              <input id="acepto" type="checkbox" checked={registro.acepto} onChange={campoRegistro('acepto')} />
              <span>Acepto la política de tratamiento de datos personales (Ley 1581 de 2012) para el seguimiento académico del curso.</span>
            </label>

            <button className="pnl-btn pnl-btn-primario" type="submit" disabled={cargando}>
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <div className="acceso-abajo">
              <span>¿Ya tienes cuenta?</span>
              <button type="button" onClick={() => cambiar('login')}>Inicia sesión</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
