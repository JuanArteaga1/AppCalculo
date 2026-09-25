/**
 * Pie de página delgado: solo el logo, el nombre de la plataforma y una
 * descripción corta. Las columnas de enlaces se quitaron porque duplicaban
 * la barra de navegación y estiraban el pie en todas las pantallas.
 */
export default function Footer() {
  const anio = new Date().getFullYear();

  return (
    <footer className="pie">
      <div className="pie-fila">
        <img className="pie-logo" src="/LogoUniversidad.png" alt="Logo de la Universidad Autónoma" />
        <div className="pie-txt">
          <strong>EDUCALC XE</strong>
          <p>
            Plataforma educativa de Cálculo Diferencial de la Universidad Autónoma:
            teoría, ejercicios interactivos y laboratorio de graficación.
          </p>
        </div>
        <span className="pie-copy">© {anio} EDUCALC XE</span>
      </div>
    </footer>
  );
}
