import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renderiza una expresión LaTeX con KaTeX.
 * Se usa en toda la interfaz del laboratorio para que las funciones se lean
 * en notación matemática real y no como texto de teclado.
 */
export default function Tex({ tex, display = false, style, className }) {
  const html = useMemo(() => {
    if (!tex) return '';
    try {
      return katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        errorColor: '#EF4444',
        trust: false,
        strict: 'ignore',
      });
    } catch {
      return '';
    }
  }, [tex, display]);

  if (!html) return <span style={style} className={className}>{tex}</span>;

  return (
    <span
      className={className}
      style={style}
      // KaTeX genera el marcado; la entrada viene de mathjs, nunca del HTML del usuario.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
