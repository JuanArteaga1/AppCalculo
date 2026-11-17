/**
 * Resolución con IA para el laboratorio (spec-gestion-ia). Valida la expresión en el
 * navegador y la envía al tutor del backend (`/api/tutor`); aquí no hay ninguna clave.
 */

import { parse } from 'mathjs';
import { chatbotMensaje } from './chatbotService';

/** Lo unico que puede aparecer como variable en una expresion del alumno. */
const SIMBOLOS_PERMITIDOS = ['x', 'e', 'pi', 'i', 'tau', 'phi', 'Infinity'];

/**
 * Valida que el input del usuario sea un ejercicio de cálculo
 * y no un intento de jailbreak o prompt injection.
 * Retorna true si el input es válido.
 */
export function validarInputSeguro(input) {
  if (!input || input.length > 500) return false;

  // Palabras clave sospechosas de jailbreak / prompt injection
  const blacklist = [
    'ignora tus instrucciones', 'ignore your instructions',
    'eres un', 'pretend', 'pretende', 'actúa como si',
    'olvida lo anterior', 'forget previous',
    'nuevo rol', 'new role', 'cambia de rol',
    'sin restricciones', 'without restrictions', 'no rules',
    'hack', 'exploit', 'vulnerabilidad',
    'dan', 'jailbreak', 'prompt injection',
    'codigo malicioso', 'malware', 'virus',
    'genera contenido', 'generate content',
    'escribe un poema', 'write a poem', 'cuentame un chiste',
    'traduce', 'translate',
    'sql', 'xss', 'csrf',
  ];

  const lowerInput = input.toLowerCase();
  for (const palabra of blacklist) {
    if (lowerInput.includes(palabra)) return false;
  }

  // La comprobación de fondo: lo que se envía tiene que ser una expresión
  // matemática de verdad, no texto. Pedir "que contenga una palabra clave de
  // cálculo" rechazaba funciones legítimas como 1/x; parsearla es exacto.
  return esExpresionMatematica(input);
}

/**
 * True si el texto es una expresión que mathjs sabe leer y cuyas únicas
 * variables son x y las constantes conocidas.
 *
 * Es la barrera real contra la inyección de prompts: una frase como
 * "ignora tus instrucciones" se parsea como los símbolos `ignora` y `todo`,
 * que no están permitidos, y se rechaza.
 */
function esExpresionMatematica(texto) {
  try {
    const nodo = parse(String(texto).trim());
    const variables = nodo
      .filter((n, ruta, padre) => n.isSymbolNode && !(padre?.isFunctionNode && ruta === 'fn'))
      .map((n) => n.name);
    return variables.every((nombre) => SIMBOLOS_PERMITIDOS.includes(nombre));
  } catch {
    return false;
  }
}

/** True si el valor es un número finito (o una cadena que lo represente). */
function esNumeroFinito(valor) {
  if (valor === null || valor === undefined || valor === '') return false;
  return Number.isFinite(Number(valor));
}

/**
 * Pregunta corta para el tutor (máximo 1000 caracteres en el backend). El system prompt
 * del backend ya pide resolver paso a paso, explicar cada paso y usar LaTeX.
 */
function construirPregunta(modo, params) {
  const { fn, a, x0 } = params;

  if (modo === 'limite') {
    return `Calcula paso a paso el límite de f(x) = ${fn} cuando x tiende a ${a}. Identifica el tipo de límite, intenta la sustitución directa, elige la técnica si hay indeterminación y explica qué significa el resultado en la gráfica.`;
  }

  if (modo === 'derivada') {
    return `Halla paso a paso la derivada de f(x) = ${fn}, di qué reglas de derivación usas y evalúala en x = ${x0 || '0'}. Explica qué significa ese valor como pendiente de la recta tangente.`;
  }

  return `Resuelve paso a paso este ejercicio de cálculo con f(x) = ${fn}: identifica qué tipo de problema es y explica cada paso.`;
}

/**
 * Envía el ejercicio al tutor del backend y devuelve la resolución paso a paso.
 * @param {string} modo - 'limite' | 'derivada' | 'aplicacion'
 * @param {Object} params - { fn, a, x0, h }
 * @returns {Promise<{ok: boolean, respuesta?: string, error?: string, requiereSesion?: boolean}>}
 */
export async function resolverConIA(modo, params) {
  // Validación en la frontera: nada sale sin comprobarse (el backend vuelve a validar).
  if (!validarInputSeguro(params?.fn)) {
    return {
      ok: false,
      error: 'La funcion no parece una expresion matematica valida. Revisala antes de pedir la explicacion.',
    };
  }
  for (const [nombre, valor] of [['a', params.a], ['x0', params.x0], ['h', params.h]]) {
    if (valor !== undefined && valor !== null && valor !== '' && !esNumeroFinito(valor)) {
      return { ok: false, error: `El parametro ${nombre} tiene que ser un numero.` };
    }
  }

  const tema = modo === 'derivada' ? 'derivadas' : modo === 'aplicacion' ? 'aplicaciones' : 'limites';
  return chatbotMensaje(tema, construirPregunta(modo, params));
}
