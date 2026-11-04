import { useEffect, useState } from 'react';
import { cursoLocal, obtenerCurso, obtenerTema } from '../services/temasService';

/** Empieza con la copia local para que la lista aparezca sin esperar al servidor. */
export function useCurso() {
  const [curso, setCurso] = useState(cursoLocal);

  useEffect(() => {
    let vigente = true;
    obtenerCurso().then((datos) => {
      if (vigente) setCurso(datos);
    });
    return () => {
      vigente = false;
    };
  }, []);

  return curso;
}

export function useTema(modulo, numero) {
  const clave = `${modulo}/${numero}`;
  const [resultado, setResultado] = useState({ clave: null, tema: null });

  useEffect(() => {
    let vigente = true;
    obtenerTema(modulo, numero).then((tema) => {
      if (vigente) setResultado({ clave, tema });
    });
    return () => {
      vigente = false;
    };
  }, [clave, modulo, numero]);

  return resultado.clave === clave
    ? { tema: resultado.tema, cargando: false }
    : { tema: null, cargando: true };
}
