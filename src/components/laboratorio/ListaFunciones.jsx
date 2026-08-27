import Tex from './Tex';

/**
 * Lista lateral de funciones graficadas.
 * Cada entrada se muestra en notación matemática y permite seleccionarla,
 * ocultarla, editarla o borrarla.
 */
export default function ListaFunciones({
  funciones,
  activaId,
  onSeleccionar,
  onAlternarVisible,
  onEditar,
  onEliminar,
}) {
  if (!funciones.length) {
    return (
      <div className="lab-lista-vacia">
        Todavía no hay funciones. Escribe una arriba y presiona <b>Enter</b>.
      </div>
    );
  }

  return (
    <ul className="lab-lista">
      {funciones.map((f) => (
        <li
          key={f.id}
          className={`lab-item ${f.id === activaId ? 'activo' : ''} ${f.visible ? '' : 'oculto'}`}
          style={{ '--color-fn': f.color }}
        >
          <button
            type="button"
            className="lab-item-color"
            onClick={() => onAlternarVisible(f.id)}
            title={f.visible ? 'Ocultar del plano' : 'Mostrar en el plano'}
            aria-label={f.visible ? 'Ocultar función' : 'Mostrar función'}
          >
            <span className="lab-item-punto" />
          </button>

          <button
            type="button"
            className="lab-item-expr"
            onClick={() => onSeleccionar(f.id)}
            title="Analizar esta función"
          >
            <Tex tex={`${f.nombre}(x) = ${f.tex}`} />
          </button>

          <span className="lab-item-acciones">
            <button type="button" onClick={() => onEditar(f.id)} title="Editar" aria-label="Editar función">✎</button>
            <button type="button" onClick={() => onEliminar(f.id)} title="Eliminar" aria-label="Eliminar función">✕</button>
          </span>
        </li>
      ))}
    </ul>
  );
}
