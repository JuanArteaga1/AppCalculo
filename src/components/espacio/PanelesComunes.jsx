import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay } from 'react-icons/fi';
import { ChatEstudiante } from '../ChatSection';
import { extraerYoutubeId, youtubeEmbed } from '../../data/videos';
import { alerta, alertaError } from '../../services/alertas';
import {
  borrarEjercicio,
  listarChats,
  listarEjercicios,
  listarVideosVistos,
} from '../../services/progresoService';

export function PanelLaboratorio({ rol }) {
  const [ejercicios, setEjercicios] = useState([]);

  useEffect(() => {
    if (rol !== 'estudiante') return undefined;
    let vigente = true;
    listarEjercicios().then((lista) => {
      if (vigente) setEjercicios(lista);
    });
    return () => {
      vigente = false;
    };
  }, [rol]);

  const quitar = async (id) => {
    try {
      await borrarEjercicio(id);
      setEjercicios((prev) => prev.filter((e) => e._id !== id));
      alerta.ok('Ejercicio quitado', 'Ya no aparece en tu laboratorio.');
    } catch (error) {
      alertaError('No se pudo quitar', error);
    }
  };

  if (rol !== 'estudiante') {
    return (
      <section className="panel">
        <div className="panel-cabeza">
          <h1>Laboratorio</h1>
          <p>Las gráficas que preparaste para tus clases. Ábrelas para proyectarlas o compartirlas.</p>
        </div>
        <div className="aviso-caja">
          El guardado de ejercicios del laboratorio está en el espacio del estudiante.
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Laboratorio</h1>
        <p>Las funciones que graficaste. Ábrelas para seguir explorando.</p>
      </div>

      {ejercicios.length === 0 ? (
        <div className="aviso-caja">
          Todavía no guardas ejercicios.{' '}
          <Link to="/laboratorio">Abre el laboratorio</Link>, grafica una función y pulsa Guardar.
        </div>
      ) : (
        <div className="fila-3">
          {ejercicios.map((g) => (
            <div key={g._id} className="tarjeta">
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: '15px', fontWeight: 700, color: '#3730A3' }}>
                {g.nombre}
              </span>
              <span className="suave-txt">
                {(g.funciones ?? []).map((f) => f.entrada).filter(Boolean).join(' · ') || 'Sin funciones'}
              </span>
              <div className="acciones">
                <Link className="pnl-btn pnl-btn-secundario" to={`/laboratorio?ejercicioId=${g._id}`}>
                  Abrir
                </Link>
                <button type="button" className="pnl-btn pnl-btn-chico" onClick={() => quitar(g._id)}>
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function PanelVideos({ rol }) {
  const [videos, setVideos] = useState([]);
  const [activo, setActivo] = useState(null);

  useEffect(() => {
    if (rol !== 'estudiante') return undefined;
    let vigente = true;
    listarVideosVistos().then((lista) => {
      if (vigente) setVideos(lista);
    });
    return () => {
      vigente = false;
    };
  }, [rol]);

  if (rol !== 'estudiante') {
    return (
      <section className="panel">
        <div className="panel-cabeza">
          <h1>Mis videos</h1>
          <p>Los videos que asignaste al grupo. Puedes agregar más desde la videoteca.</p>
        </div>
        <div className="aviso-caja">
          El historial de videos vistos se guarda en la cuenta del estudiante.
        </div>
      </section>
    );
  }

  const reproduciendo = videos.find((v) => v.youtubeId === activo);
  const idReproduciendo = extraerYoutubeId(reproduciendo?.youtubeId);

  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Mis videos</h1>
        <p>Los que ya abriste, sin repetidos. Sigue explorando en la videoteca.</p>
      </div>

      {reproduciendo && (
        <div className="tarjeta">
          <h2>{reproduciendo.titulo}</h2>
          <iframe
            title={reproduciendo.titulo}
            src={youtubeEmbed(idReproduciendo)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: 12 }}
          />
        </div>
      )}

      {videos.length === 0 ? (
        <div className="aviso-caja">
          Aún no has visto videos.{' '}
          <Link to="/videoteca">Ir a la videoteca</Link>
        </div>
      ) : (
        <ul className="lista">
          {videos.map((v) => (
            <li key={v.youtubeId} className="item">
              <button
                type="button"
                className="item-play"
                aria-label={`Reproducir ${v.titulo}`}
                onClick={() => setActivo(v.youtubeId)}
              >
                <FiPlay />
              </button>
              <span className="item-txt">
                <b>{v.titulo}</b>
                <span>{v.unidad || 'Videoteca'}</span>
              </span>
              <span className="estado" data-e="calificado">Visto</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function PanelTutor({ rol }) {
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [tema, setTema] = useState('limites');
  const [iniciales, setIniciales] = useState(null);
  const [clave, setClave] = useState('nuevo');

  useEffect(() => {
    if (rol !== 'estudiante') return undefined;
    let vigente = true;
    listarChats().then((lista) => {
      if (vigente) setChats(lista);
    });
    return () => {
      vigente = false;
    };
  }, [rol]);

  const alGuardar = (chat) => {
    setChatId(chat._id);
    setChats((prev) => [chat, ...prev.filter((c) => c._id !== chat._id)]);
  };

  const abrir = (chat) => {
    setChatId(chat._id);
    setTema(chat.tema || 'limites');
    setIniciales(chat.mensajes ?? []);
    setClave(chat._id);
  };

  const nuevo = () => {
    setChatId(null);
    setIniciales(null);
    setClave(`nuevo-${Date.now()}`);
  };

  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Tutor IA</h1>
        <p>
          {rol === 'maestro'
            ? 'Pide ejercicios, ejemplos o explicaciones para preparar tus clases.'
            : 'Pregunta lo que quieras, paso a paso y sin prisa. Tus chats se guardan en tu cuenta.'}
        </p>
      </div>

      {rol === 'estudiante' && (
        <div className="tarjeta">
          <div className="cabeza-fila">
            <h2>Conversaciones</h2>
            <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={nuevo}>
              Chat nuevo
            </button>
          </div>
          {chats.length === 0 ? (
            <p className="suave-txt">Todavía no tienes chats guardados.</p>
          ) : (
            <div className="chips">
              {chats.map((c) => (
                <button key={c._id} type="button" onClick={() => abrir(c)}>
                  {c.titulo || 'Conversación'}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <ChatEstudiante
        key={clave}
        tema={tema}
        unidadTitulo="Cálculo I"
        mensajesIniciales={iniciales}
        chatIdInicial={chatId}
        onGuardado={rol === 'estudiante' ? alGuardar : undefined}
      />
    </section>
  );
}

export function PanelAjustes({ rol }) {
  const [ritmo, setRitmo] = useState('Normal');
  const [letra, setLetra] = useState('A+');

  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Ajustes</h1>
        <p>Haz que la app se adapte a ti. Desde aquí también retomas lo que guardaste.</p>
      </div>

      {rol === 'estudiante' && (
        <div className="fila-3">
          <div className="tarjeta">
            <span className="mini-label">Laboratorio</span>
            <p className="suave-txt">Reabre las funciones que guardaste.</p>
            <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to="/espacio/estudiante/laboratorio">
              Mis ejercicios
            </Link>
          </div>
          <div className="tarjeta">
            <span className="mini-label">Videos</span>
            <p className="suave-txt">Los videos que ya viste, sin repetidos.</p>
            <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to="/espacio/estudiante/videos">
              Mis videos
            </Link>
          </div>
          <div className="tarjeta">
            <span className="mini-label">Tutor IA</span>
            <p className="suave-txt">Retoma tus chats con el asistente.</p>
            <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to="/espacio/estudiante/tutor">
              Mis chats
            </Link>
          </div>
        </div>
      )}

      <div className="tarjeta">
        <div className="ajuste">
          <span>
            Ritmo de estudio
            <small>Cuánto detalle ves en la teoría</small>
          </span>
          <div className="seg">
            {['Express', 'Normal', 'Profundo'].map((r) => (
              <button key={r} type="button" aria-pressed={ritmo === r} onClick={() => setRitmo(r)}>{r}</button>
            ))}
          </div>
        </div>

        <div className="ajuste">
          <span>Tamaño de letra</span>
          <div className="seg">
            {['A', 'A+', 'A++'].map((l) => (
              <button key={l} type="button" aria-pressed={letra === l} onClick={() => setLetra(l)}>{l}</button>
            ))}
          </div>
        </div>

        <label className="ajuste" htmlFor="aj-avisos">
          <span>
            Avisos de entregas
            <small>
              {rol === 'maestro'
                ? 'Te avisamos cuando alguien entrega'
                : 'Te avisamos un día antes de la fecha de entrega'}
            </small>
          </span>
          <input className="switch" type="checkbox" id="aj-avisos" defaultChecked />
        </label>

        <label className="ajuste" htmlFor="aj-anim">
          <span>Reducir animaciones</span>
          <input className="switch" type="checkbox" id="aj-anim" />
        </label>
      </div>
    </section>
  );
}
