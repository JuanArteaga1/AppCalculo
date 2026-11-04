# vite-project/backend/scripts/ — tareas manuales de datos

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `migrarTemas.js` | Pasa `src/data/temas.js` a MongoDB; solo crea lo que falta |
| `crearAdmin.js` | Crea el administrador inicial desde `ADMIN_*` |
| `crearUsuariosPrueba.js` | Una cuenta activa por rol; credenciales en `../usuarios-prueba.json`, ignorado por git; `--borrar` las quita |

## Rutas y relaciones
- Importa de: `schemas/`, `lib/`, `src/data/`, `src/lib/`.
- `npm run migrar-temas` y `npm run crear-usuarios-prueba` desde `backend/`; `node scripts/crearAdmin.js` igual.

## No hacer
- Usar `--forzar` sin confirmación: borra lo publicado por el administrador.
- Imprimir o subir al repositorio las contraseñas de `usuarios-prueba.json`: son cortas, solo para desarrollo.
- Pasar a producción con esas cuentas: antes, `npm run crear-usuarios-prueba -- --borrar`.

## Probar
- `node --check` del archivo y `npm start` desde `backend/`. Sin tests aún (EG-051). No ejecutar contra la base real sin permiso.
