import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { destinoAlIngresar, useSesion } from '../context/sesion';
import FormularioLogin from '../components/auth/FormularioLogin';
import FormularioRegistro from '../components/auth/FormularioRegistro';
import FormularioRecuperar from '../components/auth/FormularioRecuperar';

/**
 * Pantalla de acceso: ingresar, recuperar contraseña y crear cuenta.
 * Ingresar y crear cuenta (estudiantes, con confirmación por correo) usan el
 * backend; recuperar acceso envía un enlace por correo (spec-recuperar-acceso).
 */
export default function Acceso() {
  const { usuario, entrar } = useSesion();

  const [params] = useSearchParams();
  const [form, setForm] = useState(params.get('form') === 'registro' ? 'registro' : 'login');

  const volver = params.get('volver');

  // Con sesión no hay nada que hacer aquí: a su espacio, o de vuelta si su rol puede ver esa página.
  if (usuario) return <Navigate to={destinoAlIngresar(usuario.rol, volver)} replace />;

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
          <FormularioLogin
            alEntrar={(respuesta) => entrar(respuesta.usuario)}
            alRecuperar={() => setForm('recuperar')}
            alRegistro={() => setForm('registro')}
          />
        )}

        {form === 'recuperar' && (
          <FormularioRecuperar
            alLogin={() => setForm('login')}
          />
        )}

        {form === 'registro' && (
          <FormularioRegistro
            alLogin={() => setForm('login')}
          />
        )}
      </section>
    </div>
  );
}
