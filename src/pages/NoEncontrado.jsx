import { Link, useLocation } from 'react-router-dom';
import Tex from '../components/laboratorio/Tex';

/** Página 404. destino lleva al sitio útil más cercano: el inicio o la sección padre. */
export default function NoEncontrado({
  titulo = 'No encontramos esta página',
  mensaje = 'La dirección puede estar mal escrita o la página ya no existe.',
  destino = '/',
  textoDestino = 'Ir al inicio',
}) {
  const { pathname } = useLocation();

  return (
    <section className="no-encontrado">
      <p className="no-encontrado-codigo" aria-hidden="true">404</p>
      <Tex tex={'\\lim_{x \\to 404} \\text{página}(x) = \\text{no existe}'} display className="no-encontrado-limite" />
      <h1>{titulo}</h1>
      <p>{mensaje}</p>
      <code className="no-encontrado-ruta">{pathname}</code>
      <div className="no-encontrado-acciones">
        <Link className="pnl-btn pnl-btn-primario" to={destino}>{textoDestino}</Link>
        {destino === '/' && <Link className="pnl-btn pnl-btn-secundario" to="/calculo1">Ver Cálculo I</Link>}
      </div>
    </section>
  );
}
