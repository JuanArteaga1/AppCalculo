import GraficaLimite from './GraficaLimite';
import { useDatosLimite } from './laboratorio/useDatosLimite';

/**
 * Gráfica de explicación sin animación ni tabla: muestra la curva completa
 * desde el primer render. Se usa junto a cada propiedad o ejemplo donde la
 * gráfica solo ilustra, sin ejercicio interactivo.
 */
export default function GraficaEstatica({ expr, punto, modo = 'limite' }) {
  const porLados = modo === 'laterales';
  const { filas, limite, puntosGrafica, laterales, valorEnPunto } = useDatosLimite(expr, punto);

  if (!filas.length) return null;

  return (
    <div style={estilos.contenedor}>
      <GraficaLimite
        expr={expr}
        punto={punto}
        limite={limite}
        puntos={puntosGrafica}
        puntosVisibles={puntosGrafica.length}
        estado="completa"
        porLados={porLados}
        limiteIzq={laterales.izq}
        limiteDer={laterales.der}
        valorEnPunto={valorEnPunto}
      />
    </div>
  );
}

const estilos = {
  contenedor: {
    minWidth: 0,
    maxWidth: '100%',
    margin: '12px 0',
  },
};
