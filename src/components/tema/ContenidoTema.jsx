import { Component, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { enlazarTerminos } from '../../data/glosario';
import { extraerYoutubeId, youtubeEmbed } from '../../data/videos';
import { useSesion } from '../../context/sesion';
import { registrarVideoVisto } from '../../services/progresoService';
import { MARCA_ALINEACION } from '../../lib/bloques';
import AsintotasInteractivas from '../AsintotasInteractivas';
import GraficaAsintotaDefinicion from '../GraficaAsintotaDefinicion';
import GraficaConceptualInfinito from '../GraficaConceptualInfinito';
import GraficaDiscontinuidad from '../GraficaDiscontinuidad';
import GraficaEstatica from '../GraficaEstatica';
import GraficaLimiteInfinito from '../GraficaLimiteInfinito';
import TablaLimiteInteractiva from '../TablaLimiteInteractiva';
import EjercicioBloque from './EjercicioBloque';
import { estilosContenido as styles } from './estilosContenido';

const SEPARADOR = '\n\u0001\n';
const FORMULA = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
const ALINEACION = { centro: 'center', derecha: 'right' };

/**
 * KaTeX dibuja la raiz con un <svg> cuyo atributo d trae saltos de linea. Como
 * el contenido se recorre linea a linea, esos saltos partian la formula y las
 * coordenadas del trazo aparecian impresas como texto. Dentro del HTML el salto
 * no significa nada, asi que se cambia por un espacio.
 */
const enUnaLinea = (html) => html.replace(/\r?\n/g, ' ');

/** Las celdas se insertan como HTML: la negrita hay que convertirla aquí. */
const conNegrita = (celda) => celda.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

/**
 * El texto lo escribe el administrador y termina dentro de dangerouslySetInnerHTML,
 * así que nada de lo que escriba puede convertirse en etiqueta o atributo. Las
 * fórmulas quedan fuera porque las procesa KaTeX, que no admite HTML. El > no se
 * toca: sin < no abre etiquetas y marca las citas.
 */
function escaparTexto(texto) {
  return String(texto ?? '')
    .split(FORMULA)
    .map((parte, i) => (i % 2 === 1
      ? parte
      : parte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')))
    .join('');
}

function renderLatex(text) {
  if (!text) return text;
  let result = text;

  // Enlaces internos del curso (/calculo1/...). Los externos del glosario
  // (https://...) se convierten luego en renderEnlaces.
  result = result.replace(/\[([^\]]+)\]\((\/(?!\/)[^)\s]+)\)/g, '<a class="tema-enlace" data-interno="true" href="$2">$1</a>');

  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
    try {
      return enUnaLinea(katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false }));
    } catch {
      return latex;
    }
  });

  result = result.replace(/\$([^$\n]+?)\$/g, (_, latex) => {
    try {
      return enUnaLinea(katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false }));
    } catch {
      return latex;
    }
  });

  return result;
}

function renderEnlaces(html) {
  if (!html) return html;
  // Enlaces del glosario con definición: [texto](url){data-definicion="..."}
  // Se convierten en <a> con clase glosario-enlace y atributo data-definicion
  const conDefinicion = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)\{data-definicion="([^"]+)"\}/g,
    '<a class="tema-enlace glosario-enlace" href="$2" target="_blank" rel="noopener noreferrer" data-definicion="$3">$1</a>'
  );
  // Enlaces normales sin definición
  return conDefinicion.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a class="tema-enlace" href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

const aHtml = (texto) => renderEnlaces(renderLatex(texto));
const textoEnHtml = (texto) => conNegrita(aHtml(escaparTexto(texto)));

/** Negritas **...** dentro de un párrafo o cita. */
function hijosEnLinea(texto) {
  return texto.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={pIdx} dangerouslySetInnerHTML={{ __html: part.slice(2, -2) }} />;
    }

    return <span key={pIdx} dangerouslySetInnerHTML={{ __html: part }} />;
  });
}

/**
 * Un párrafo escrito en varias líneas tiene que salir como un solo <p>. Si no,
 * cada renglón se vuelve un párrafo suelto y el texto se ve con huecos.
 */
function esEspecial(linea) {
  const t = linea.trim();
  if (!t) return true;
  if (/^(#{1,6} |[-*] |\d+\. |\||> |---)/.test(t)) return true;
  if (t.startsWith('<span class="katex-display"')) return true;
  return t.startsWith('[') && t.includes(']=') && !t.includes('](');
}

/** Separa la marca {centro} o {derecha} del resto de la línea. */
function separarMarca(linea) {
  const marca = linea.match(MARCA_ALINEACION);
  return marca ? [ALINEACION[marca[1]], linea.slice(marca[0].length)] : [undefined, linea];
}

const alinear = (estilo, alineacion) => (alineacion ? { ...estilo, textAlign: alineacion } : estilo);

function renderTexto(html) {
  const unidas = [];

  for (const linea of html.split('\n')) {
    const previa = unidas[unidas.length - 1];
    const abreParrafo = MARCA_ALINEACION.test(linea.trim());
    if (previa !== undefined && !abreParrafo && !esEspecial(linea) && !esEspecial(separarMarca(previa.trim())[1])) {
      unidas[unidas.length - 1] = previa.trimEnd() + ' ' + linea.trim();
    } else {
      unidas.push(linea);
    }
  }

  const elementos = [];
  let items = [];

  const cerrarLista = () => {
    if (!items.length) return;
    elementos.push(
      <ul key={`lista-${elementos.length}`} style={styles.list}>
        {items.map((item, i) => (
          <li key={i} style={alinear(styles.listItem, item.alineacion)} dangerouslySetInnerHTML={{ __html: conNegrita(item.html) }} />
        ))}
      </ul>
    );
    items = [];
  };

  unidas.forEach((linea, idx) => {
    const [alineacion, t] = separarMarca(linea.trim());

    if (!t) {
      cerrarLista();
      return;
    }

    if (t.startsWith('- ') || t.startsWith('* ')) {
      items.push({ html: t.slice(2), alineacion });
      return;
    }

    cerrarLista();

    if (t.startsWith('## ')) {
      elementos.push(<h2 key={idx} style={alinear(styles.h2, alineacion)} dangerouslySetInnerHTML={{ __html: t.slice(3) }} />);
    } else if (t.startsWith('### ')) {
      elementos.push(<h3 key={idx} style={alinear(styles.h3, alineacion)} dangerouslySetInnerHTML={{ __html: t.slice(4) }} />);
    } else if (/^-{3,}\s*$/.test(t)) {
      elementos.push(<hr key={idx} style={styles.hr} />);
    } else if (t.startsWith('> ')) {
      elementos.push(<blockquote key={idx} style={alinear(styles.cita, alineacion)}>{hijosEnLinea(t.replace(/^>\s?/, ''))}</blockquote>);
    } else if (t.startsWith('[') && t.includes(']=') && !t.includes('](')) {
      elementos.push(
        <div key={idx} style={styles.equation}>
          <code style={styles.equationCode}>{t.replace(/\[|\]/g, '')}</code>
        </div>
      );
    } else {
      elementos.push(<p key={idx} className={alineacion && 'tema-alineado'} style={alinear(styles.paragraph, alineacion)}>{hijosEnLinea(t)}</p>);
    }
  });

  cerrarLista();
  return elementos;
}

const DIBUJOS = {
  'grafica-conceptual': GraficaConceptualInfinito,
  'grafica-infinito': GraficaLimiteInfinito,
};

function Dibujo({ componente, variante }) {
  if (componente === 'grafica-asintota') return <GraficaAsintotaDefinicion tipo={variante} />;
  if (componente === 'grafica-discontinuidad') return <GraficaDiscontinuidad tipo={variante} />;
  const Grafica = DIBUJOS[componente];
  return Grafica ? <Grafica variante={variante} /> : null;
}

function Tabla({ bloque }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          {bloque.encabezados.map((celda, i) => (
            <th key={i} style={styles.th} dangerouslySetInnerHTML={{ __html: textoEnHtml(celda) }} />
          ))}
        </tr>
      </thead>
      <tbody>
        {bloque.filas.map((fila, i) => (
          <tr key={i}>
            {fila.map((celda, j) => (
              <td key={j} style={styles.td} dangerouslySetInnerHTML={{ __html: textoEnHtml(celda) }} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Video({ url, titulo }) {
  const id = extraerYoutubeId(url);
  const { usuario } = useSesion();

  useEffect(() => {
    if (usuario?.rol !== 'estudiante' || !id) return;
    registrarVideoVisto({ youtubeId: id, titulo: titulo || 'Video del tema' });
  }, [usuario, id, titulo]);

  if (!id) return <p className="suave-txt">Enlace de video no válido.</p>;

  return (
    <div className="bloque-video">
      <iframe src={youtubeEmbed(id)} title={titulo || 'Video del tema'} loading="lazy" allowFullScreen />
    </div>
  );
}

function Imagen({ url, alt, pie }) {
  return (
    <figure className="bloque-imagen">
      <img src={url} alt={alt} loading="lazy" />
      {pie && <figcaption>{pie}</figcaption>}
    </figure>
  );
}

/** Una gráfica con una función inválida no debe tumbar el resto del tema. */
class ProtegerBloque extends Component {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  render() {
    if (this.state.fallo) return <p className="suave-txt">No se pudo mostrar este bloque.</p>;
    return this.props.children;
  }
}

function enlazarTextos(bloques) {
  const textos = [];

  const recorrer = (lista) => {
    for (const bloque of lista) {
      if (bloque.tipo === 'texto') textos.push(escaparTexto(bloque.texto));
      if (bloque.tipo === 'desplegable') {
        textos.push(escaparTexto(bloque.titulo));
        recorrer(bloque.bloques);
      }
    }
  };

  recorrer(bloques);

  // El glosario enlaza un número limitado de términos por tema, no por bloque:
  // por eso se procesa todo junto y luego se reparte.
  return enlazarTerminos(textos.join(SEPARADOR)).split(SEPARADOR);
}

function renderBloques(lista, textos) {
  return lista.map((bloque, i) => {
    const clave = bloque.id ?? i;

    switch (bloque.tipo) {
      case 'texto':
        return <div key={clave} style={styles.bloqueTexto}>{renderTexto(aHtml(textos.shift()))}</div>;
      case 'desplegable': {
        const titulo = aHtml(textos.shift());
        return (
          <details key={clave} className="tema-desplegable" style={styles.desplegable}>
            <summary style={styles.desplegableTitulo}>{hijosEnLinea(titulo)}</summary>
            <div style={styles.desplegableCuerpo}>{renderBloques(bloque.bloques, textos)}</div>
          </details>
        );
      }
      case 'tabla':
        return <Tabla key={clave} bloque={bloque} />;
      case 'video':
        return <Video key={clave} url={bloque.url} titulo={bloque.titulo} />;
      case 'imagen':
        return <Imagen key={clave} url={bloque.url} alt={bloque.alt} pie={bloque.pie} />;
      case 'ejercicio':
        return (
          <EjercicioBloque
            key={clave}
            enunciado={textoEnHtml(bloque.enunciado)}
            opciones={bloque.opciones.map(textoEnHtml)}
            correcta={bloque.correcta}
            explicacion={textoEnHtml(bloque.explicacion)}
          />
        );
      case 'tabla-limite':
        return (
          <ProtegerBloque key={`${clave}-${bloque.expr}`}>
            <TablaLimiteInteractiva
              expr={bloque.expr}
              punto={bloque.punto}
              modo={bloque.modo || undefined}
              visual={bloque.visual || undefined}
              relleno={bloque.relleno || ''}
            />
          </ProtegerBloque>
        );
      case 'grafica-funcion':
        return (
          <ProtegerBloque key={`${clave}-${bloque.expr}`}>
            <GraficaEstatica expr={bloque.expr} punto={bloque.punto} modo={bloque.modo || undefined} />
          </ProtegerBloque>
        );
      case 'asintotas':
        return (
          <ProtegerBloque key={`${clave}-${bloque.expr}`}>
            <AsintotasInteractivas expr={bloque.expr} />
          </ProtegerBloque>
        );
      case 'dibujo':
        return <Dibujo key={clave} componente={bloque.componente} variante={bloque.variante} />;
      default:
        return null;
    }
  });
}

/** Muestra un tema a partir de sus bloques: página pública y vista previa del editor. */
export default function ContenidoTema({ bloques }) {
  return renderBloques(bloques, enlazarTextos(bloques));
}
