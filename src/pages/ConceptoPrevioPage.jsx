import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import ContenidoTema from '../components/tema/ContenidoTema';
import { api } from '../services/api';
import { alertaError } from '../services/alertas';

export default function ConceptoPrevioPage() {
  const { slug } = useParams();
  const [concepto, setConcepto] = useState(null);
  const [estado, setEstado] = useState('cargando');

  useEffect(() => {
    let vigente = true;

    api(`/conceptos-previos/${encodeURIComponent(slug)}`)
      .then((datos) => {
        if (!vigente) return;
        setConcepto(datos.concepto);
        setEstado('listo');
      })
      .catch((error) => {
        if (!vigente) return;
        if (error.estado === 404) {
          setEstado('no-encontrado');
        } else {
          alertaError('No se pudo cargar el concepto previo', error);
          setEstado('error');
        }
      });

    return () => {
      vigente = false;
    };
  }, [slug]);

  if (estado === 'cargando') {
    return <div className="sesion-espera" role="status">Cargando concepto previo…</div>;
  }

  if (estado === 'no-encontrado' || estado === 'error' || !concepto) {
    return (
      <div className="pagina-publica">
        <div className="pagina-cabeza">
          <h1>Este contenido no está disponible</h1>
          <p>El concepto previo que buscas no existe o aún no está publicado.</p>
        </div>
        <Link to="/conceptos-previos" className="boton-volver">← Volver a conceptos previos</Link>
      </div>
    );
  }

  return (
    <div className="pagina-publica">
      <Link to="/conceptos-previos" className="boton-volver">← Volver a conceptos previos</Link>

      <div className="pagina-cabeza">
        <span className="eyebrow">Concepto previo</span>
        <h1>{concepto.titulo}</h1>
      </div>

      <div className="tema-lectura">
        <ContenidoTema bloques={concepto.contenido ?? []} />
      </div>
    </div>
  );
}
