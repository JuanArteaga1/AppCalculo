import { useEffect, useRef } from 'react';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import Tex from './Tex';
import { formatearValor } from './mathUtils';

/**
 * Panel de análisis de la función seleccionada: límite en un punto,
 * derivada / recta tangente, tabla de aproximación y explicación con IA.
 */
export default function PanelHerramientas({
  funcion,
  herramienta,
  onHerramienta,
  punto,
  onPunto,
  incremento,
  onIncremento,
  resultado,
  ia,
  onIA,
}) {
  const iaRef = useRef(null);

  useEffect(() => {
    if (iaRef.current && ia?.texto) {
      renderMathInElement(iaRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
          { left: '$', right: '$', display: false },
        ],
        throwOnError: false,
        errorColor: '#EF4444',
      });
    }
  }, [ia?.texto]);

  if (!funcion) {
    return (
      <div className="lab-panel-vacio">
        Selecciona una función de la lista para analizarla.
      </div>
    );
  }

  return (
    <div className="lab-herramientas">
      <div className="lab-herramientas-tabs">
        <button
          type="button"
          className={herramienta === 'limite' ? 'activo' : ''}
          onClick={() => onHerramienta('limite')}
        >
          Límite
        </button>
        <button
          type="button"
          className={herramienta === 'derivada' ? 'activo' : ''}
          onClick={() => onHerramienta('derivada')}
        >
          Derivada
        </button>
        <button
          type="button"
          className={herramienta === null ? 'activo' : ''}
          onClick={() => onHerramienta(null)}
        >
          Ninguna
        </button>
      </div>

      {herramienta && (
        <div className="lab-herramientas-campos">
          <label className="lab-campo">
            <span>{herramienta === 'limite' ? 'x tiende a' : 'punto x₀'}</span>
            <input
              value={punto}
              onChange={(e) => onPunto(e.target.value)}
              inputMode="decimal"
              spellCheck="false"
            />
          </label>
          {herramienta === 'derivada' && (
            <label className="lab-campo">
              <span>incremento h</span>
              <input
                value={incremento}
                onChange={(e) => onIncremento(e.target.value)}
                inputMode="decimal"
                spellCheck="false"
              />
            </label>
          )}
          <p className="lab-pista">Haz clic sobre la curva para fijar el punto.</p>
        </div>
      )}

      {resultado?.error && <div className="lab-error">{resultado.error}</div>}

      {resultado?.tipo === 'limite' && !resultado.error && (
        <div className="lab-resultado">
          <div className="lab-resultado-principal">
            <Tex tex={resultado.texPrincipal} display />
          </div>
          <div className="lab-resultado-filas">
            <div className="lab-fila-lado"><Tex tex={resultado.texEnPunto} /></div>
          </div>
          <p className={`lab-conclusion tipo-${resultado.analisis.tipo}`}>
            {resultado.analisis.mensaje}
          </p>
          <TablaLab datos={resultado.tabla} modo="limite" punto={punto} />
        </div>
      )}

      {resultado?.tipo === 'derivada' && !resultado.error && (
        <div className="lab-resultado">
          <div className="lab-resultado-principal">
            <Tex tex={resultado.texPrincipal} display />
          </div>
          <div className="lab-resultado-filas">
            <div className="lab-fila-lado"><Tex tex={resultado.texValor} /></div>
            {resultado.texPendiente && (
              <div className="lab-fila-lado lado-der"><Tex tex={resultado.texPendiente} /></div>
            )}
            {resultado.texTangente && (
              <div className="lab-fila-lado lado-tangente">
                <span className="lab-etiqueta">Recta tangente</span>
                <Tex tex={resultado.texTangente} />
              </div>
            )}
            {resultado.texSecante && (
              <div className="lab-fila-lado lado-secante">
                <span className="lab-etiqueta">Recta secante</span>
                <Tex tex={resultado.texSecante} />
              </div>
            )}
          </div>
          <p className="lab-conclusion">{resultado.interpretacion}</p>
          <TablaLab datos={resultado.tabla} modo="derivada" />
        </div>
      )}

      {herramienta && (
        <div className="lab-ia">
          <button type="button" className="lab-ia-btn" onClick={onIA} disabled={ia?.cargando}>
            {ia?.cargando ? 'Resolviendo…' : '✨ Explicar paso a paso con IA'}
          </button>
          {ia?.error && <div className="lab-error">{ia.error}</div>}
          {ia?.texto && (
            <div ref={iaRef} className="lab-ia-texto">
              {ia.texto.split('\n').map((linea, i) => <p key={i}>{linea}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Tabla compacta de aproximación por ambos lados.
 *
 * Para límites: en vez de mostrar el incremento abstracto "h", muestra el
 * valor real de x que se acerca al punto por cada lado (más intuitivo para
 * ver cómo x -> a por izquierda y por derecha).
 *
 * Para derivadas: se mantiene "h", porque ahí sí corresponde a la notación
 * estándar del cociente incremental (f(x0+h) - f(x0)) / h.
 */
function TablaLab({ datos, modo, punto }) {
  if (!datos?.length) return null;

  if (modo === 'limite') {
    const puntoNum = Number.parseFloat(punto);
    return (
      <div className="lab-tabla-wrap">
        <div className="lab-tabla-titulo">Aproximación por ambos lados</div>
        <table className="lab-tabla">
          <thead>
            <tr>
              <th>x (izquierda)</th>
              <th>f(x)</th>
              <th>x (derecha)</th>
              <th>f(x)</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((fila, i) => (
              <tr key={i} className={i === datos.length - 1 ? 'destacada' : ''}>
                <td>{formatearValor(puntoNum - fila.h, 5)}</td>
                <td>{formatearValor(fila.izq, 5)}</td>
                <td>{formatearValor(puntoNum + fila.h, 5)}</td>
                <td>{formatearValor(fila.der, 5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="lab-tabla-nota">
          Cada fila acerca x al punto por ambos lados; observa cómo f(x) converge al mismo valor.
        </p>
      </div>
    );
  }

  return (
    <div className="lab-tabla-wrap">
      <div className="lab-tabla-titulo">Cociente incremental</div>
      <table className="lab-tabla">
        <thead>
          <tr>
            <th>h</th>
            <th>← izquierda</th>
            <th>derecha →</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((fila, i) => (
            <tr key={i} className={i === datos.length - 1 ? 'destacada' : ''}>
              <td>{fila.h}</td>
              <td>{formatearValor(fila.izq, 5)}</td>
              <td>{formatearValor(fila.der, 5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
  