import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen } from 'react-icons/fi';
import { api } from '../services/api';
import { alertaError } from '../services/alertas';

export default function ConceptosPrevios() {
  const [conceptos, setConceptos] = useState([]);
  const [estado, setEstado] = useState('cargando');

  useEffect(() => {
    let vigente = true;

    api('/conceptos-previos')
      .then((datos) => {
        if (!vigente) return;
        setConceptos(datos.conceptos ?? []);
        setEstado('listo');
      })
      .catch((error) => {
        if (!vigente) return;
        alertaError('No se pudieron cargar los conceptos previos', error);
        setEstado('error');
      });

    return () => {
      vigente = false;
    };
  }, []);

  if (estado === 'cargando') {
    return <div className="sesion-espera" role="status">Cargando conceptos previos…</div>;
  }

  if (estado === 'error') {
    return (
      <div className="pagina-publica">
        <div className="pagina-cabeza">
          <h1>Conceptos previos</h1>
          <p>No se pudieron cargar. Inténtalo de nuevo más tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-publica">
      <div className="pagina-cabeza">
        <span className="eyebrow">Repaso</span>
        <h1>Conceptos previos</h1>
        <p>Material de apoyo para reforzar las bases antes de empezar el curso.</p>
      </div>

      {conceptos.length === 0 ? (
        <div className="aviso-caja" role="status">
          <b>Próximamente</b>
          <p>Estamos preparando el contenido de conceptos previos. Vuelve pronto.</p>
        </div>
      ) : (
        <div className="tareas-grid">
          {conceptos.map((concepto) => (
            <article key={concepto.id} className="tarea-card">
              <div className="tarea-top">
                <span className="tipo-chip estado-abierto"><FiBookOpen aria-hidden="true" /> Concepto previo</span>
              </div>
              <h2>{concepto.titulo}</h2>
              <Link
                to={`/conceptos-previos/${concepto.slug}`}
                className="pnl-btn pnl-btn-primario pnl-btn-chico"
                style={{ textDecoration: 'none' }}
              >
                Ver concepto
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
