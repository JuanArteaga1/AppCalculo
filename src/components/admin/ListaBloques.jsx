import { useState } from 'react';
import { FiArrowDown, FiArrowUp, FiChevronDown, FiChevronRight, FiCopy, FiPlus, FiTrash2 } from 'react-icons/fi';
import { CATALOGO, crearBloque, duplicarBloque, nombreBloque, resumenBloque } from './bloquesEditor';
import FormularioBloque from './FormularioBloque';

function MenuAgregar({ elegir, cerrar }) {
  return (
    <div className="editor-menu" role="menu" aria-label="Agregar bloque">
      {CATALOGO.map(({ grupo, opciones }) => (
        <div key={grupo}>
          <b>{grupo}</b>
          <div className="editor-menu-opciones">
            {opciones.map(([tipo, nombre]) => (
              <button key={tipo} type="button" role="menuitem" onClick={() => elegir(tipo)}>{nombre}</button>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="editor-menu-cerrar" onClick={cerrar}>Cancelar</button>
    </div>
  );
}

/** Lista editable de bloques. Se usa también dentro de cada plegable. */
export default function ListaBloques({ bloques, cambiar, nivel = 0 }) {
  const [abiertos, setAbiertos] = useState(() => new Set());
  const [menuEn, setMenuEn] = useState(null);

  const alternar = (id) => setAbiertos((actual) => {
    const nuevo = new Set(actual);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    return nuevo;
  });

  const parchar = (i, parche) => cambiar(bloques.map((b, j) => (j === i ? { ...b, ...parche } : b)));

  const mover = (i, paso) => {
    const lista = [...bloques];
    [lista[i], lista[i + paso]] = [lista[i + paso], lista[i]];
    cambiar(lista);
  };

  const insertar = (posicion, bloque) => {
    cambiar([...bloques.slice(0, posicion), bloque, ...bloques.slice(posicion)]);
    setAbiertos((actual) => new Set(actual).add(bloque.id));
    setMenuEn(null);
  };

  return (
    <div className="editor-lista">
      {bloques.map((bloque, i) => {
        const abierto = abiertos.has(bloque.id);

        return (
          <div key={bloque.id}>
            <article className="editor-bloque">
              <header>
                <button type="button" className="editor-bloque-titulo" aria-expanded={abierto} onClick={() => alternar(bloque.id)}>
                  {abierto ? <FiChevronDown aria-hidden="true" /> : <FiChevronRight aria-hidden="true" />}
                  <b>{nombreBloque(bloque.tipo)}</b>
                  <span>{resumenBloque(bloque)}</span>
                </button>
                <div className="editor-bloque-acciones">
                  <button type="button" className="editor-icono" aria-label="Subir bloque" disabled={i === 0} onClick={() => mover(i, -1)}><FiArrowUp /></button>
                  <button type="button" className="editor-icono" aria-label="Bajar bloque" disabled={i === bloques.length - 1} onClick={() => mover(i, 1)}><FiArrowDown /></button>
                  <button type="button" className="editor-icono" aria-label="Duplicar bloque" onClick={() => insertar(i + 1, duplicarBloque(bloque))}><FiCopy /></button>
                  <button type="button" className="editor-icono" aria-label="Agregar bloque debajo" onClick={() => setMenuEn(menuEn === i ? null : i)}><FiPlus /></button>
                  <button type="button" className="editor-icono editor-peligro" aria-label="Eliminar bloque" onClick={() => cambiar(bloques.filter((_, j) => j !== i))}><FiTrash2 /></button>
                </div>
              </header>

              {abierto && (
                <div className="editor-bloque-cuerpo">
                  <FormularioBloque bloque={bloque} nivel={nivel} cambiar={(parche) => parchar(i, parche)} />
                </div>
              )}
            </article>

            {menuEn === i && <MenuAgregar elegir={(tipo) => insertar(i + 1, crearBloque(tipo))} cerrar={() => setMenuEn(null)} />}
          </div>
        );
      })}

      {menuEn === 'fin' ? (
        <MenuAgregar elegir={(tipo) => insertar(bloques.length, crearBloque(tipo))} cerrar={() => setMenuEn(null)} />
      ) : (
        <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico editor-agregar" onClick={() => setMenuEn('fin')}>
          <FiPlus />Agregar bloque
        </button>
      )}
    </div>
  );
}
