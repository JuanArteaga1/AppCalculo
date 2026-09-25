import { useState } from 'react';
import { FILTROS_TAREA, TAREAS } from '../data/mockTareas';

/**
 * Página pública de práctica: la lista de talleres, quices y evaluaciones y,
 * al entrar en uno, el ejercicio pregunta por pregunta con su resultado.
 * Maqueta estática: la nota se calcula en el navegador y no se guarda.
 */
export default function SeguirAprendiendo() {
  const [filtro, setFiltro] = useState('Todos');
  const [tareaId, setTareaId] = useState(null);

  if (tareaId) {
    const tarea = TAREAS.find((t) => t.id === tareaId);
    return <Ejercicio tarea={tarea} onSalir={() => setTareaId(null)} />;
  }

  const lista = TAREAS.filter((t) => filtro === 'Todos' || t.tipo === filtro);

  return (
    <div className="pagina-publica">
      <div className="pagina-cabeza">
        <span className="eyebrow">Práctica</span>
        <h1>Evalúate</h1>
        <p>Los talleres, quices y evaluaciones que dejaron los profesores. Entra a uno y resuélvelo paso a paso.</p>
      </div>

      <div className="filtros">
        {FILTROS_TAREA.map(([valor, texto]) => (
          <button
            key={valor}
            type="button"
            className="pildora"
            aria-pressed={filtro === valor}
            onClick={() => setFiltro(valor)}
          >
            {texto}
          </button>
        ))}
      </div>

      <div className="tareas-grid">
        {lista.map((t) => (
          <article key={t.id} className="tarea-card">
            <div className="tarea-top">
              <span className="tipo-chip">{t.tipo}</span>
              <span className="suave-txt">{t.preguntas.length} preguntas · {t.min} min</span>
            </div>
            <h2>{t.titulo}</h2>
            <p className="suave-txt">{t.unidad}</p>
            <div className="tarea-pie">
              <span className="suave-txt">{t.prof} · entrega {t.vence}</span>
              <button
                type="button"
                className="pnl-btn pnl-btn-primario pnl-btn-chico"
                onClick={() => setTareaId(t.id)}
              >
                Hacer ejercicio
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/** Anillo de acierto del resultado final. */
function Anillo({ pct }) {
  const circunferencia = 232.5;
  return (
    <div className="anillo-caja">
      <svg className="anillo" viewBox="0 0 84 84" aria-hidden="true">
        <circle className="pista-anillo" cx="42" cy="42" r="37" />
        <circle
          className="valor"
          cx="42"
          cy="42"
          r="37"
          strokeDasharray={`${(circunferencia * pct / 100).toFixed(1)} ${circunferencia}`}
        />
      </svg>
      <span>{pct}%</span>
    </div>
  );
}

function Ejercicio({ tarea, onSalir }) {
  // 'intro' -> índice de la pregunta -> 'fin'
  const [paso, setPaso] = useState('intro');
  const [respuestas, setRespuestas] = useState([]);

  const volver = (
    <button type="button" className="volver" onClick={onSalir}>← Volver a Evalúate</button>
  );

  if (paso === 'intro') {
    return (
      <div className="pagina-publica pagina-angosta">
        {volver}
        <article className="tarjeta" style={{ gap: '16px' }}>
          <span className="tipo-chip">{tarea.tipo}</span>
          <h1 style={{ fontSize: '28px', margin: 0 }}>{tarea.titulo}</h1>
          <p className="suave-txt">{tarea.unidad} · {tarea.prof}</p>
          <ul className="reglas">
            <li>{tarea.preguntas.length} preguntas de selección múltiple</li>
            <li>Tiempo sugerido: {tarea.min} minutos</li>
            <li>Puedes volver atrás antes de enviar</li>
            <li>Al terminar ves tu resultado y la explicación de cada pregunta</li>
          </ul>
          <button type="button" className="pnl-btn pnl-btn-primario" onClick={() => setPaso(0)}>
            Comenzar <span aria-hidden="true">→</span>
          </button>
        </article>
      </div>
    );
  }

  if (paso === 'fin') {
    const aciertos = tarea.preguntas.reduce((a, q, k) => a + (respuestas[k] === q.ok ? 1 : 0), 0);
    const nota = (aciertos / tarea.preguntas.length * 5).toFixed(1);
    const pct = Math.round(aciertos / tarea.preguntas.length * 100);

    return (
      <div className="pagina-publica pagina-angosta">
        {volver}
        <article className="tarjeta resultado-final">
          <Anillo pct={pct} />
          <div>
            <h1 style={{ fontSize: '26px', margin: 0 }}>
              {pct >= 60 ? '¡Buen trabajo!' : 'Casi. Vale la pena repasar'}
            </h1>
            <p className="suave-txt">
              Acertaste {aciertos} de {tarea.preguntas.length} · nota {nota} / 5.0
            </p>
          </div>
          <span className="nota-grande" style={{ fontSize: '30px', marginLeft: 'auto' }}>{nota}</span>
        </article>

        <article className="tarjeta">
          <h2>Revisión</h2>
          {tarea.preguntas.map((q, k) => {
            const bien = respuestas[k] === q.ok;
            return (
              <div key={q.p} className="pregunta">
                <b>{k + 1}. {q.p}</b>
                <span className="estado" data-e={bien ? 'calificado' : 'pendiente'}>
                  {bien ? 'Correcta' : 'Incorrecta'}
                </span>
                <p className="suave-txt">
                  Tu respuesta: {respuestas[k] != null ? q.ops[respuestas[k]] : 'sin responder'}
                  {!bien && <> · Correcta: <b>{q.ops[q.ok]}</b></>}
                </p>
                <p className="suave-txt">{q.pista}</p>
              </div>
            );
          })}
          <div className="acciones">
            <button
              type="button"
              className="pnl-btn pnl-btn-primario"
              onClick={() => { setRespuestas([]); setPaso(0); }}
            >
              Repetir ejercicio
            </button>
            <button type="button" className="pnl-btn pnl-btn-secundario" onClick={onSalir}>
              Volver a la lista
            </button>
          </div>
        </article>
      </div>
    );
  }

  const q = tarea.preguntas[paso];
  const elegida = respuestas[paso];
  const ultima = paso + 1 === tarea.preguntas.length;

  const elegir = (j) => {
    const copia = [...respuestas];
    copia[paso] = j;
    setRespuestas(copia);
  };

  return (
    <div className="pagina-publica pagina-angosta">
      {volver}
      <article className="tarjeta" style={{ gap: '18px' }}>
        <div className="cabeza-fila">
          <span className="suave-txt">Pregunta {paso + 1} de {tarea.preguntas.length}</span>
          <span className="tipo-chip">{tarea.tipo} · {tarea.titulo}</span>
        </div>

        <div className="barra-simple ambar">
          <i style={{ width: `${Math.round(paso / tarea.preguntas.length * 100)}%` }} />
        </div>

        <h1 style={{ fontSize: '23px', margin: 0 }}>{q.p}</h1>

        <div className="opciones">
          {q.ops.map((o, j) => (
            <button
              key={o}
              type="button"
              className={`opcion ${elegida === j ? 'elegida' : ''}`}
              onClick={() => elegir(j)}
            >
              <span className="letra">{'ABCD'[j]}</span>
              {o}
            </button>
          ))}
        </div>

        <details className="pista">
          <summary>Ver una pista</summary>
          <p className="suave-txt">{q.pista}</p>
        </details>

        <div className="acciones" style={{ justifyContent: 'space-between' }}>
          {paso > 0
            ? <button type="button" className="pnl-btn pnl-btn-secundario" onClick={() => setPaso(paso - 1)}>← Anterior</button>
            : <span />}
          <button
            type="button"
            className="pnl-btn pnl-btn-primario"
            disabled={elegida == null}
            onClick={() => setPaso(ultima ? 'fin' : paso + 1)}
          >
            {ultima ? 'Ver resultado' : 'Siguiente →'}
          </button>
        </div>
      </article>
    </div>
  );
}
