import { useId, useState } from 'react';
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import { extraerYoutubeId } from '../../data/videos';
import { api } from '../../services/api';
import AreaTexto from './AreaTexto';
import { DIBUJOS, errorExpresion } from './bloquesEditor';
import ListaBloques from './ListaBloques';

function Campo({ etiqueta, ayuda, error, children }) {
  const id = useId();

  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      {children(id)}
      {ayuda && <small className="campo-ayuda">{ayuda}</small>}
      {error && <small className="campo-error" role="alert">{error}</small>}
    </div>
  );
}

function CampoTexto({ etiqueta, valor, cambiar, ayuda, error, placeholder, tipo = 'text' }) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda} error={error}>
      {(id) => <input id={id} type={tipo} step="any" value={valor} placeholder={placeholder} onChange={(e) => cambiar(e.target.value)} />}
    </Campo>
  );
}

function CampoArea({ etiqueta, valor, cambiar, ayuda, filas = 4, formato = false }) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda}>
      {(id) => <AreaTexto id={id} valor={valor} cambiar={cambiar} filas={filas} formato={formato} />}
    </Campo>
  );
}

function CampoLista({ etiqueta, valor, cambiar, opciones }) {
  return (
    <Campo etiqueta={etiqueta}>
      {(id) => (
        <select id={id} className="admin-select" value={valor} onChange={(e) => cambiar(e.target.value)}>
          {opciones.map(([v, texto]) => <option key={v} value={v}>{texto}</option>)}
        </select>
      )}
    </Campo>
  );
}

const AYUDA_TEXTO = 'Título y alineación se aplican al párrafo donde está el cursor. Selecciona palabras y pulsa Enlace para enlazarlas. Negrita con **texto** y listas con -.';

function CamposFuncion({ bloque, cambiar }) {
  return (
    <div className="editor-fila">
      <CampoTexto
        etiqueta="Función"
        valor={bloque.expr}
        cambiar={(expr) => cambiar({ expr })}
        error={errorExpresion(bloque.expr)}
        ayuda="Usa x. Por partes: x < 1 ? x + 1 : 3 - x"
      />
      <CampoTexto
        etiqueta="Punto"
        tipo="number"
        valor={bloque.punto}
        cambiar={(punto) => cambiar({ punto: punto === '' ? '' : Number(punto) })}
      />
    </div>
  );
}

function FormTabla({ bloque, cambiar }) {
  const fijarEncabezado = (i, valor) => cambiar({ encabezados: bloque.encabezados.map((c, j) => (j === i ? valor : c)) });
  const fijarCelda = (f, c, valor) => cambiar({
    filas: bloque.filas.map((fila, i) => (i === f ? fila.map((x, j) => (j === c ? valor : x)) : fila)),
  });
  const agregarColumna = () => cambiar({
    encabezados: [...bloque.encabezados, `Columna ${bloque.encabezados.length + 1}`],
    filas: bloque.filas.map((fila) => [...fila, '']),
  });
  const quitarColumna = (c) => cambiar({
    encabezados: bloque.encabezados.filter((_, j) => j !== c),
    filas: bloque.filas.map((fila) => fila.filter((_, j) => j !== c)),
  });

  return (
    <div className="editor-tabla">
      <div className="tabla-caja">
        <table>
          <thead>
            <tr>
              {bloque.encabezados.map((celda, c) => (
                <th key={c}>
                  <input aria-label={`Encabezado ${c + 1}`} value={celda} onChange={(e) => fijarEncabezado(c, e.target.value)} />
                  {bloque.encabezados.length > 1 && (
                    <button type="button" className="editor-icono" aria-label={`Quitar columna ${c + 1}`} onClick={() => quitarColumna(c)}><FiTrash2 /></button>
                  )}
                </th>
              ))}
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {bloque.filas.map((fila, f) => (
              <tr key={f}>
                {fila.map((celda, c) => (
                  <td key={c}>
                    <input aria-label={`Fila ${f + 1}, columna ${c + 1}`} value={celda} onChange={(e) => fijarCelda(f, c, e.target.value)} />
                  </td>
                ))}
                <td>
                  <button type="button" className="editor-icono" aria-label={`Quitar fila ${f + 1}`} onClick={() => cambiar({ filas: bloque.filas.filter((_, i) => i !== f) })}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="editor-acciones">
        <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={() => cambiar({ filas: [...bloque.filas, bloque.encabezados.map(() => '')] })}><FiPlus />Fila</button>
        <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={agregarColumna}><FiPlus />Columna</button>
      </div>
      <small className="campo-ayuda">Las celdas admiten fórmulas con $x^2$.</small>
    </div>
  );
}

function FormEjercicio({ bloque, cambiar }) {
  const grupo = useId();
  const fijarOpcion = (i, valor) => cambiar({ opciones: bloque.opciones.map((o, j) => (j === i ? valor : o)) });

  const quitar = (i) => {
    const opciones = bloque.opciones.filter((_, j) => j !== i);
    const correcta = i === bloque.correcta ? 0 : bloque.correcta - (i < bloque.correcta ? 1 : 0);
    cambiar({ opciones, correcta });
  };

  return (
    <>
      <CampoArea etiqueta="Enunciado" filas={3} valor={bloque.enunciado} cambiar={(enunciado) => cambiar({ enunciado })} />
      <fieldset className="editor-opciones">
        <legend>Opciones (marca la correcta)</legend>
        {bloque.opciones.map((opcion, i) => (
          <div key={i} className="editor-opcion">
            <input type="radio" name={grupo} aria-label={`Marcar la opción ${i + 1} como correcta`} checked={bloque.correcta === i} onChange={() => cambiar({ correcta: i })} />
            <input type="text" aria-label={`Opción ${i + 1}`} value={opcion} onChange={(e) => fijarOpcion(i, e.target.value)} />
            {bloque.opciones.length > 2 && (
              <button type="button" className="editor-icono" aria-label={`Quitar la opción ${i + 1}`} onClick={() => quitar(i)}><FiTrash2 /></button>
            )}
          </div>
        ))}
        {bloque.opciones.length < 8 && (
          <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={() => cambiar({ opciones: [...bloque.opciones, ''] })}><FiPlus />Opción</button>
        )}
      </fieldset>
      <CampoArea etiqueta="Explicación" filas={3} valor={bloque.explicacion} cambiar={(explicacion) => cambiar({ explicacion })} ayuda="Se muestra después de comprobar la respuesta." />
    </>
  );
}

function FormImagen({ bloque, cambiar }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');

  const subir = async (evento) => {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!archivo) return;

    setError('');
    setSubiendo(true);

    try {
      const formulario = new FormData();
      formulario.append('imagen', archivo);
      const { url } = await api('/admin/archivos', { metodo: 'POST', archivo: formulario });
      cambiar({ url });
    } catch (e) {
      setError(e.message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <>
      <label className="pnl-btn pnl-btn-secundario pnl-btn-chico editor-subir">
        <FiUpload />
        {subiendo ? 'Subiendo…' : bloque.url ? 'Cambiar imagen' : 'Subir imagen'}
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={subir} disabled={subiendo} />
      </label>
      <small className="campo-ayuda">PNG, JPG o WebP de hasta 5 MB.</small>
      {error && <small className="campo-error" role="alert">{error}</small>}
      <CampoTexto etiqueta="Texto alternativo" valor={bloque.alt} cambiar={(alt) => cambiar({ alt })} ayuda="Describe la imagen para quien no puede verla." />
      <CampoTexto etiqueta="Pie de imagen (opcional)" valor={bloque.pie} cambiar={(pie) => cambiar({ pie })} />
    </>
  );
}

export default function FormularioBloque({ bloque, cambiar, nivel }) {
  switch (bloque.tipo) {
    case 'texto':
      return <CampoArea etiqueta="Contenido" filas={8} formato valor={bloque.texto} cambiar={(texto) => cambiar({ texto })} ayuda={AYUDA_TEXTO} />;
    case 'tabla':
      return <FormTabla bloque={bloque} cambiar={cambiar} />;
    case 'desplegable':
      return (
        <>
          <CampoTexto etiqueta="Título" valor={bloque.titulo} cambiar={(titulo) => cambiar({ titulo })} />
          <ListaBloques bloques={bloque.bloques} cambiar={(bloques) => cambiar({ bloques })} nivel={nivel + 1} />
        </>
      );
    case 'video':
      return (
        <>
          <CampoTexto
            etiqueta="Enlace de YouTube"
            valor={bloque.url}
            cambiar={(url) => cambiar({ url })}
            placeholder="https://www.youtube.com/watch?v=..."
            error={bloque.url && !extraerYoutubeId(bloque.url) ? 'Ese enlace no parece de YouTube.' : null}
          />
          <CampoTexto etiqueta="Título (opcional)" valor={bloque.titulo} cambiar={(titulo) => cambiar({ titulo })} />
        </>
      );
    case 'imagen':
      return <FormImagen bloque={bloque} cambiar={cambiar} />;
    case 'grafica-funcion':
      return <CamposFuncion bloque={bloque} cambiar={cambiar} />;
    case 'tabla-limite':
      return (
        <>
          <CamposFuncion bloque={bloque} cambiar={cambiar} />
          <div className="editor-fila">
            <CampoLista etiqueta="Modo" valor={bloque.modo} cambiar={(modo) => cambiar({ modo })} opciones={[['limite', 'Límite'], ['laterales', 'Laterales']]} />
            <CampoLista etiqueta="Presentación" valor={bloque.visual} cambiar={(visual) => cambiar({ visual })} opciones={[['interactivo', 'Animada con botón Resolver'], ['estatico', 'Estática']]} />
            <CampoLista
              etiqueta="En un salto, punto lleno"
              valor={bloque.relleno ?? ''}
              cambiar={(relleno) => cambiar({ relleno })}
              opciones={[['', 'Ninguno'], ['izquierda', 'Rama izquierda'], ['derecha', 'Rama derecha']]}
            />
          </div>
        </>
      );
    case 'asintotas':
      return (
        <CampoTexto
          etiqueta="Función"
          valor={bloque.expr}
          cambiar={(expr) => cambiar({ expr })}
          error={errorExpresion(bloque.expr)}
          ayuda="El estudiante pulsa Resolver y ve dibujarse las asíntotas."
        />
      );
    case 'dibujo': {
      const [, variantes] = DIBUJOS[bloque.componente];
      return (
        <div className="editor-fila">
          <CampoLista
            etiqueta="Dibujo"
            valor={bloque.componente}
            cambiar={(componente) => cambiar({ componente, variante: DIBUJOS[componente][1][0][0] })}
            opciones={Object.entries(DIBUJOS).map(([clave, [nombre]]) => [clave, nombre])}
          />
          <CampoLista etiqueta="Variante" valor={bloque.variante} cambiar={(variante) => cambiar({ variante })} opciones={variantes} />
        </div>
      );
    }
    case 'ejercicio':
      return <FormEjercicio bloque={bloque} cambiar={cambiar} />;
    default:
      return null;
  }
}
