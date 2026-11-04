import { useState } from 'react';
import { FiArrowDown, FiArrowUp, FiChevronRight, FiPlus, FiTrash2 } from 'react-icons/fi';
import { extraerYoutubeId, youtubeThumb } from '../../data/videos';
import { errorFuncionLab, nuevoId } from './bloquesEditor';

function mover(lista, i, paso) {
  const copia = [...lista];
  [copia[i], copia[i + paso]] = [copia[i + paso], copia[i]];
  return copia;
}

function Controles({ i, total, nombre, cambiar, lista }) {
  return (
    <div className="editor-bloque-acciones">
      <button type="button" className="editor-icono" aria-label={`Subir ${nombre} ${i + 1}`} disabled={i === 0} onClick={() => cambiar(mover(lista, i, -1))}><FiArrowUp /></button>
      <button type="button" className="editor-icono" aria-label={`Bajar ${nombre} ${i + 1}`} disabled={i === total - 1} onClick={() => cambiar(mover(lista, i, 1))}><FiArrowDown /></button>
      <button type="button" className="editor-icono editor-peligro" aria-label={`Eliminar ${nombre} ${i + 1}`} onClick={() => cambiar(lista.filter((_, j) => j !== i))}><FiTrash2 /></button>
    </div>
  );
}

function Seccion({ titulo, cantidad, ayuda, children }) {
  return (
    <details className="tarjeta editor-recurso">
      <summary>
        <FiChevronRight className="editor-recurso-flecha" aria-hidden="true" />
        {titulo}
        <span className="editor-recurso-cuenta">{cantidad}</span>
      </summary>
      <p className="suave-txt">{ayuda}</p>
      {children}
    </details>
  );
}

/** Videos del tema. Solo enlaces de YouTube; el orden es el que ve el estudiante. */
export function EditorVideos({ videos, cambiar }) {
  const [enlace, setEnlace] = useState('');
  const [error, setError] = useState('');

  const parchar = (i, parche) => cambiar(videos.map((v, j) => (j === i ? { ...v, ...parche } : v)));

  const agregar = () => {
    const id = extraerYoutubeId(enlace);

    if (!id) {
      setError('Ese enlace no parece de YouTube.');
      return;
    }

    if (videos.some((v) => extraerYoutubeId(v.url) === id)) {
      setError('Ese video ya está en la lista.');
      return;
    }

    cambiar([...videos, { id: nuevoId(), url: enlace.trim(), titulo: '', descripcion: '' }]);
    setEnlace('');
    setError('');
  };

  return (
    <Seccion
      titulo="Videos del tema"
      cantidad={videos.length}
      ayuda="El primero es el que se reproduce al abrir el tema. Agrega los que quieras: solo enlaces de YouTube."
    >
      {videos.length > 0 && (
        <ol className="recurso-lista">
          {videos.map((video, i) => {
            const id = extraerYoutubeId(video.url);

            return (
              <li key={video.id} className="recurso-fila">
                {id
                  ? <img className="recurso-miniatura" src={youtubeThumb(id)} alt="" loading="lazy" />
                  : <span className="recurso-miniatura" aria-hidden="true" />}

                <div className="recurso-campos">
                  <input aria-label={`Enlace del video ${i + 1}`} placeholder="Enlace de YouTube" value={video.url} onChange={(e) => parchar(i, { url: e.target.value })} />
                  <input aria-label={`Título del video ${i + 1}`} placeholder="Título (opcional)" value={video.titulo} onChange={(e) => parchar(i, { titulo: e.target.value })} />
                  <input aria-label={`Descripción del video ${i + 1}`} placeholder="Descripción (opcional)" value={video.descripcion} onChange={(e) => parchar(i, { descripcion: e.target.value })} />
                </div>

                <Controles i={i} total={videos.length} nombre="el video" lista={videos} cambiar={cambiar} />
              </li>
            );
          })}
        </ol>
      )}

      <div className="recurso-agregar">
        <input
          aria-label="Enlace del video nuevo"
          placeholder="Pega un enlace de YouTube"
          value={enlace}
          onChange={(e) => {
            setEnlace(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              agregar();
            }
          }}
        />
        <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" disabled={!enlace.trim()} onClick={agregar}><FiPlus />Agregar video</button>
      </div>
      {error && <small className="campo-error" role="alert">{error}</small>}
    </Seccion>
  );
}

/** Ejercicios que llevan al laboratorio con la función ya cargada. */
export function EditorPracticas({ practicas, cambiar, herramienta }) {
  const parchar = (i, parche) => cambiar(practicas.map((p, j) => (j === i ? { ...p, ...parche } : p)));

  const agregar = () => cambiar([...practicas, {
    id: nuevoId(),
    titulo: `Ejercicio ${practicas.length + 1}`,
    funcion: 'x^2',
    herramienta,
    punto: 1,
  }]);

  return (
    <Seccion
      titulo="Ejercicios de práctica"
      cantidad={practicas.length}
      ayuda="El estudiante elige uno y el laboratorio se abre con esa función. El enunciado se le muestra arriba."
    >
      {practicas.length > 0 && (
        <ol className="recurso-lista">
          {practicas.map((practica, i) => {
            const error = errorFuncionLab(practica.funcion);

            return (
              <li key={practica.id} className="recurso-fila">
                <div className="recurso-campos">
                  <input aria-label={`Enunciado del ejercicio ${i + 1}`} placeholder="Enunciado" value={practica.titulo} onChange={(e) => parchar(i, { titulo: e.target.value })} />
                  <div className="recurso-fila-datos">
                    <input aria-label={`Función del ejercicio ${i + 1}`} placeholder="Función, por ejemplo x^2 - 1" value={practica.funcion} onChange={(e) => parchar(i, { funcion: e.target.value })} />
                    <select className="admin-select" aria-label={`Herramienta del ejercicio ${i + 1}`} value={practica.herramienta} onChange={(e) => parchar(i, { herramienta: e.target.value })}>
                      <option value="limite">Límite</option>
                      <option value="derivada">Derivada</option>
                    </select>
                    <input
                      type="number"
                      step="any"
                      aria-label={`Punto del ejercicio ${i + 1}`}
                      placeholder="Punto"
                      value={practica.punto}
                      onChange={(e) => parchar(i, { punto: e.target.value === '' ? '' : Number(e.target.value) })}
                    />
                  </div>
                  {error && <small className="campo-error" role="alert">{error}</small>}
                </div>

                <Controles i={i} total={practicas.length} nombre="el ejercicio" lista={practicas} cambiar={cambiar} />
              </li>
            );
          })}
        </ol>
      )}

      <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico editor-agregar" onClick={agregar}><FiPlus />Agregar ejercicio</button>
    </Seccion>
  );
}
