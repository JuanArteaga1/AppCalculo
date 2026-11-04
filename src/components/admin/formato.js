/** Numero con separador de miles, como se escribe en Colombia. */
export const entero = (n) => n.toLocaleString('es-CO');

/** Un decimal con coma: 46,7. */
export const decimal = (n) => n.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
