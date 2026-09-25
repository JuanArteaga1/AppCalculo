import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay } from 'react-icons/fi';
import { GRAFICAS_GUARDADAS, SUGERENCIAS_TUTOR, VIDEOS_ESPACIO } from '../../data/mockEspacio';

/** Gráficas guardadas. El trazo es decorativo: aquí no se evalúa la función. */
export function PanelLaboratorio({ rol }) {
  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Laboratorio</h1>
        <p>
          {rol === 'maestro'
            ? 'Las gráficas que preparaste para tus clases. Ábrelas para proyectarlas o compartirlas.'
            : 'Las funciones que graficaste. Ábrelas para seguir explorando.'}
        </p>
      </div>

      <div className="fila-3">
        {GRAFICAS_GUARDADAS.map((g) => (
          <div key={g.fn} className="tarjeta">
            <svg className="grafica-mini" viewBox="0 0 200 110" preserveAspectRatio="none" aria-hidden="true">
              <path d={g.trazo} stroke="#4F46E5" strokeWidth="3" fill="none" strokeLinecap="round" />
              {g.tangente && (
                <path d={g.tangente} stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              )}
              {g.punto && (
                <circle cx={g.punto.cx} cy={g.punto.cy} r="5" fill="#FFFFFF" stroke="#3730A3" strokeWidth="2.5" />
              )}
            </svg>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: '15px', fontWeight: 700, color: '#3730A3' }}>
              {g.fn}
            </span>
            <span className="suave-txt">{g.detalle}</span>
            <Link className="pnl-btn pnl-btn-secundario" to="/laboratorio">Abrir</Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PanelVideos({ rol }) {
  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Mis videos</h1>
        <p>
          {rol === 'maestro'
            ? 'Los videos que asignaste al grupo. Puedes agregar más desde la videoteca.'
            : 'Te quedan 3 videos por ver. Uno al día es suficiente.'}
        </p>
      </div>

      <ul className="lista">
        {VIDEOS_ESPACIO.map((v) => (
          <li key={v.titulo} className="item">
            <button type="button" className="item-play" aria-label={`Reproducir ${v.titulo}`}>
              <FiPlay />
            </button>
            <span className="item-txt">
              <b>{v.titulo}</b>
              <span>{v.detalle}</span>
            </span>
            {rol === 'maestro'
              ? <span className="suave-txt">{v.vistoPor}</span>
              : <span className="estado" data-e="pendiente">Pendiente</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PanelTutor({ rol }) {
  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Tutor IA</h1>
        <p>
          {rol === 'maestro'
            ? 'Pide ejercicios, ejemplos o explicaciones para preparar tus clases.'
            : 'Pregunta lo que quieras, paso a paso y sin prisa.'}
        </p>
      </div>

      <div className="tarjeta">
        <label className="pregunta-caja" htmlFor="pregunta-tutor">
          <input id="pregunta-tutor" type="text" placeholder="Escribe tu pregunta…" />
          <button type="button" className="pnl-btn pnl-btn-primario pnl-btn-chico">Preguntar</button>
        </label>
        <span className="suave-txt">Retoma una conversación</span>
        <div className="chips">
          {SUGERENCIAS_TUTOR[rol].map((c) => (
            <button key={c} type="button">{c}</button>
          ))}
        </div>
      </div>
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
        <p>Haz que la app se adapte a ti.</p>
      </div>

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
