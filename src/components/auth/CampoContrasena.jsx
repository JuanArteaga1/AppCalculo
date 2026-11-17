import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

/**
 * Input de contraseña con botón de ojo para mostrarla u ocultarla.
 * Recibe las mismas props que un <input>; el tipo lo controla el botón.
 */
export default function CampoContrasena(props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="campo-clave">
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="campo-clave-ojo"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        aria-controls={props.id}
        title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
      </button>
    </div>
  );
}
