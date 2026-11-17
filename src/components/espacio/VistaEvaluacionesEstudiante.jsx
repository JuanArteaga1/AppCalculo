import { Link } from 'react-router-dom';

const ETIQUETA_ESTADO = {
  pendiente: { texto: 'Por responder', clase: 'estado-abierto' },
  respondido: { texto: 'Realizado', clase: 'estado-respondido' },
  vencido: { texto: 'Vencido', clase: 'estado-vencido' },
  'no-disponible': { texto: 'No disponible', clase: 'estado-no-disponible' },
};

function formatearFecha(fechaIso) {
  if (!fechaIso) return null;
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return null;
  return fecha.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function TarjetaEvaluacion({ evaluacion }) {
  const estado = ETIQUETA_ESTADO[evaluacion.estado] ?? ETIQUETA_ESTADO['no-disponible'];
  const moduloTitulo = evaluacion.modulo?.titulo ?? evaluacion.modulo?.clave ?? 'Curso';
  const temas = (evaluacion.temas ?? [])
    .map((t) => t.titulo ?? t.numero)
    .filter(Boolean)
    .join(', ');

  return (
    <article className="tarea-card">
      <div className="tarea-top">
        <span className={`tipo-chip ${estado.clase}`}>{estado.texto}</span>
        {evaluacion.fechaLimite && (
          <span className="suave-txt">Entrega: {formatearFecha(evaluacion.fechaLimite)}</span>
        )}
      </div>
      <h2>{evaluacion.titulo}</h2>
      <p className="suave-txt">
        {moduloTitulo}
        {temas && ` · ${temas}`}
      </p>
      <div className="tarea-pie">
        {evaluacion.nota != null ? (
          <span className="suave-txt">Nota: {evaluacion.nota.toFixed(1)}</span>
        ) : (
          <span className="suave-txt">Aún sin responder</span>
        )}
        <Link
          to={`/quiz/${evaluacion.id}`}
          className="pnl-btn pnl-btn-primario pnl-btn-chico"
          style={{ textDecoration: 'none' }}
        >
          {evaluacion.estado === 'pendiente' ? 'Responder' : 'Ver'}
        </Link>
      </div>
    </article>
  );
}

function Seccion({ titulo, evaluaciones, vacio }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 22, margin: '0 0 18px' }}>{titulo}</h2>
      {evaluaciones.length === 0 ? (
        <p className="suave-txt">{vacio}</p>
      ) : (
        <div className="tareas-grid">
          {evaluaciones.map((evaluacion) => (
            <TarjetaEvaluacion key={evaluacion.id} evaluacion={evaluacion} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function VistaEvaluacionesEstudiante({ evaluaciones }) {
  const abiertos = evaluaciones.filter((e) => e.estado === 'pendiente');
  const realizados = evaluaciones.filter((e) => e.estado === 'respondido');
  const otros = evaluaciones.filter((e) => !['pendiente', 'respondido'].includes(e.estado));

  return (
    <div className="pagina-publica">
      <div className="pagina-cabeza">
        <span className="eyebrow">Evaluaciones</span>
        <h1>Tus evaluate</h1>
        <p>Aquí aparecen los quizzes y evaluaciones que has abierto. Los que aún no respondes están en "Abiertos".</p>
      </div>

      <Seccion
        titulo="Abiertos"
        evaluaciones={abiertos}
        vacio="No tienes evaluate abiertos pendientes de responder."
      />

      <Seccion
        titulo="Realizados"
        evaluaciones={realizados}
        vacio="Aún no has respondido ningún evaluate."
      />

      {otros.length > 0 && (
        <Seccion
          titulo="Vencidos / No disponibles"
          evaluaciones={otros}
          vacio=""
        />
      )}
    </div>
  );
}
