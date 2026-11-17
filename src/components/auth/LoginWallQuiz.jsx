import { useState } from 'react';
import { FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import FormularioLogin from './FormularioLogin';
import FormularioRegistro from './FormularioRegistro';
import FormularioRecuperar from './FormularioRecuperar';
import { useSesion } from '../../context/sesion';

const MODOS = [
  { clave: 'login', texto: 'Iniciar sesión' },
  { clave: 'registro', texto: 'Registrarse' },
  { clave: 'recuperar', texto: 'Recuperar acceso' },
];

function esUrlDeQuizValida(url) {
  return /^\/quiz\/[a-zA-Z0-9_-]+$/.test(url);
}

export default function LoginWallQuiz({ quizId }) {
  const { entrar } = useSesion();
  const navigate = useNavigate();
  const [modo, setModo] = useState('login');

  const retorno = `/quiz/${quizId}`;
  const retornoSeguro = esUrlDeQuizValida(retorno) ? retorno : '/';

  const alEntrar = (respuesta) => {
    entrar(respuesta.usuario);
    navigate(retornoSeguro, { replace: true });
  };

  return (
    <div className="login-wall">
      <aside className="login-wall-izq">
        <div className="login-wall-caja">
          <div className="login-wall-logo">
            <img src="/LogoUniversidad.png" alt="Logo de la Universidad Autónoma" />
          </div>
          <span className="login-wall-eyebrow">Evaluación protegida</span>
          <h1>Desbloquea tu evaluación</h1>
          <p>
            Inicia sesión para realizar este quiz, guardar tu progreso y recibir
            retroalimentación personalizada.
          </p>
          <ul className="login-wall-beneficios">
            <li><FiLock aria-hidden="true" /> Tu avance se guarda automáticamente.</li>
            <li><FiLock aria-hidden="true" /> Recibes tu nota al instante.</li>
            <li><FiLock aria-hidden="true" /> Puedes revisar tus respuestas cuando el quiz venza.</li>
          </ul>
        </div>
      </aside>

      <section className="login-wall-der">
        <div className="login-wall-tabs" role="tablist" aria-label="Modo de autenticación">
          {MODOS.map(({ clave, texto }) => (
            <button
              key={clave}
              type="button"
              role="tab"
              aria-selected={modo === clave}
              aria-controls={`panel-${clave}`}
              id={`tab-${clave}`}
              className={modo === clave ? 'activa' : ''}
              onClick={() => setModo(clave)}
            >
              {texto}
            </button>
          ))}
        </div>

        <div
          className="login-wall-panel"
          role="tabpanel"
          id={`panel-${modo}`}
          aria-labelledby={`tab-${modo}`}
        >
          {modo === 'login' && (
            <FormularioLogin
              alEntrar={alEntrar}
              alRecuperar={() => setModo('recuperar')}
              alRegistro={() => setModo('registro')}
            />
          )}

          {modo === 'registro' && (
            <FormularioRegistro
              alLogin={() => setModo('login')}
            />
          )}

          {modo === 'recuperar' && (
            <FormularioRecuperar
              alLogin={() => setModo('login')}
            />
          )}
        </div>
      </section>
    </div>
  );
}
