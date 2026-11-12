import { FiRefreshCw } from 'react-icons/fi';
import Tex from './laboratorio/Tex';

/** Pantalla para cuando la API no responde; nunca se rellena con datos locales. */
export default function EstadoServicio({
  titulo = 'Servicio no disponible',
  mensaje = 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  onReintentar,
}) {
  return (
    <section className="no-encontrado" role="alert">
      <p className="no-encontrado-codigo" aria-hidden="true">503</p>
      <Tex tex={'\\lim_{x \\to \\infty} \\text{servidor}(x) = \\text{sin respuesta}'} display className="no-encontrado-limite" />
      <h1>{titulo}</h1>
      <p>{mensaje}</p>
      <p className="suave-txt">Si el problema continúa, inténtalo más tarde.</p>
      <div className="no-encontrado-acciones">
        <button type="button" className="pnl-btn pnl-btn-primario" onClick={onReintentar}>
          <FiRefreshCw aria-hidden="true" /> Reintentar
        </button>
      </div>
    </section>
  );
}
