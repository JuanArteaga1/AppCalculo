import { useId, useState } from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

/**
 * Ejercicio de opción múltiple dentro de un tema. Se corrige en el navegador y
 * no guarda nada: sirve para practicar, no para calificar.
 * Los textos llegan ya procesados y escapados por ContenidoTema.
 */
export default function EjercicioBloque({ enunciado, opciones, correcta, explicacion }) {
  const grupo = useId();
  const [elegida, setElegida] = useState(null);
  const [comprobado, setComprobado] = useState(false);
  const acerto = elegida === correcta;

  const elegir = (i) => {
    setElegida(i);
    setComprobado(false);
  };

  return (
    <fieldset className="bloque-ejercicio">
      <legend>Ponte a prueba</legend>
      <p dangerouslySetInnerHTML={{ __html: enunciado }} />

      <div className="bloque-ejercicio-opciones">
        {opciones.map((opcion, i) => (
          <label key={i} className={comprobado && i === correcta ? 'es-correcta' : undefined}>
            <input type="radio" name={grupo} checked={elegida === i} onChange={() => elegir(i)} />
            <span dangerouslySetInnerHTML={{ __html: opcion }} />
          </label>
        ))}
      </div>

      <button type="button" className="pnl-btn pnl-btn-azul pnl-btn-chico" disabled={elegida === null} onClick={() => setComprobado(true)}>
        Comprobar respuesta
      </button>

      {comprobado && (
        <div className={`bloque-ejercicio-resultado ${acerto ? 'bien' : 'mal'}`} role="status">
          <b>{acerto ? <FiCheckCircle aria-hidden="true" /> : <FiXCircle aria-hidden="true" />}{acerto ? 'Correcto' : 'Todavía no'}</b>
          {explicacion && <span dangerouslySetInnerHTML={{ __html: explicacion }} />}
        </div>
      )}
    </fieldset>
  );
}
