import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiSettings, FiUser, FiUsers } from 'react-icons/fi';

/**
 * Pantalla de acceso: ingresar, recuperar contraseña y crear cuenta.
 * Maqueta estática: los formularios no envían nada todavía, solo cambian de
 * vista para poder revisar el flujo completo con el cliente.
 */
export default function Acceso() {


  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [cargando, setCargando] = useState(false);


  const [params] = useSearchParams();
  const [form, setForm] = useState(params.get('form') === 'registro' ? 'registro' : 'login');
  const [avisoEnviado, setAvisoEnviado] = useState(false);

  const cambiar = (cual) => {
    setForm(cual);
    setAvisoEnviado(false);
  };


  const iniciarSesion = async (e) => {
    e.preventDefault();

    setErrorLogin('');
    setCargando(true);

    try {
      const respuesta = await fetch(
        'http://localhost:5100/usuarios/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            correo,
            contrasena,
          }),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setErrorLogin(
          data.mensaje || 'No se pudo iniciar sesión.'
        );
        return;
      }

      if (data.usuario.rol === 'administrador') {
        navigate('/admin/panel');
      } else {
        setErrorLogin(
          'El acceso funciona, pero este ejemplo solo redirige al administrador.'
        );
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setErrorLogin(
        'No se pudo conectar con el servidor. Comprueba que el backend esté activo.'
      );
    } finally {
      setCargando(false);
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

            <div className="campo">
              <label htmlFor="correo">Correo institucional</label>
              <input
                id="correo"
                type="email"
                placeholder="nombre.apellido@uni.edu"
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

            {errorLogin && (
              <div className="aviso-caja" role="alert">
                {errorLogin}
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

            <div className="acceso-perfiles">
              <span className="acceso-perfiles-rotulo">Demo sin sesión · entra directo como</span>
              <div className="acceso-perfiles-botones">
                <Link className="perfil-btn" to="/espacio/estudiante/progreso">
                  <FiUser aria-hidden="true" />
                  Estudiante
                </Link>
                <Link className="perfil-btn" to="/espacio/maestro/aprender">
                  <FiUsers aria-hidden="true" />
                  Maestro
                </Link>
                <Link className="perfil-btn" to="/admin/panel">
                  <FiSettings aria-hidden="true" />
                  Administrador
                </Link>
              </div>
            </div>
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
              <input id="correo-rec" type="email" placeholder="nombre.apellido@uni.edu" autoComplete="email" />
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

        {form === 'registro' && (
          <form className="acceso-form" onSubmit={(e) => e.preventDefault()}>
            <h2>Crear cuenta</h2>
            <p className="suave-txt">Solo necesitas tu correo institucional.</p>

            <div className="fila-2">
              <div className="campo">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" type="text" placeholder="María" autoComplete="given-name" />
              </div>
              <div className="campo">
                <label htmlFor="apellido">Apellido</label>
                <input id="apellido" type="text" placeholder="Benavidez" autoComplete="family-name" />
              </div>
            </div>

            <div className="campo">
              <label htmlFor="correo-reg">Correo institucional</label>
              <input id="correo-reg" type="email" placeholder="nombre.apellido@uni.edu" autoComplete="email" />
            </div>

            <div className="campo">
              <label htmlFor="clave-reg">Contraseña</label>
              <input id="clave-reg" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            </div>

            <label className="acepto" htmlFor="acepto">
              <input id="acepto" type="checkbox" />
              <span>Acepto el tratamiento de mis datos para el seguimiento académico del curso.</span>
            </label>

            <button className="pnl-btn pnl-btn-primario" type="submit">Crear cuenta</button>

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
