# Gestión de eventos

La ruta `/app/eventos` consulta la API compartida con Android. No necesita otro backend ni cambios en AWS.

## Contrato revisado

Referencia: `SyncPass`, commit `ebc2f47`, `EventoController`, `EventoService` y `ApiDtos.EventoRequest/EventoResponse`.

- `GET /api/eventos`: lista cronológica para cualquier usuario autenticado. El backend admite el filtro opcional `proyectoId`.
- `POST /api/eventos`: crea y devuelve el evento con estado HTTP 201.
- `PUT /api/eventos/{id}`: actualiza y devuelve el evento confirmado.
- `DELETE /api/eventos/{id}`: devuelve 204 sin cuerpo.
- `GET /api/proyectos` y `GET /api/usuarios/me`: reutilizados para seleccionar proyectos por nombre y comprobar propiedad.

Crear, editar y eliminar requieren DOCENTE o ADMIN. Además, el servicio exige ser responsable del proyecto o administrador. Cambiar de proyecto exige permiso sobre el proyecto actual y el de destino. La interfaz ofrece solo proyectos gestionables y el backend vuelve a comprobar cada escritura.

Los participantes y voluntarios consultan eventos sin controles de gestión. No se utiliza el rol ESTUDIANTE para habilitar escrituras. Los administradores pueden gestionar todos los proyectos.

## Formulario y reglas

Proyecto y nombre son obligatorios. La fecha usa `input type="date"` y la hora `input type="time"`. Se combinan como `fechaHora` local, sin `Date`, `toISOString` ni conversión de zona horaria; los segundos existentes se conservan al editar.

Se validan el calendario y la hora, nombre hasta 160 caracteres, descripción hasta 4000, recinto hasta 160 y dirección hasta 240. Los cupos son enteros no negativos; 0 significa sin límite. Al editar, un cupo positivo no puede ser menor que las inscripciones existentes. El backend también valida esta regla ante cambios concurrentes.

Latitud y longitud son opcionales y se completan juntas, con rangos de -90 a 90 y -180 a 180. El radio es un entero de 1 a 50000 metros (valor inicial 200). Los estados son PROGRAMADO, EN_CURSO, FINALIZADO y CANCELADO. No se impone una fecha futura porque el contrato no lo exige.

Los eventos con inscripciones o presentes no se pueden eliminar. La tarjeta explica que deben cancelarse desde Editar. Si el historial cambia después de cargar la lista, se conserva el mensaje de conflicto HTTP 409 dentro del diálogo de confirmación.

## Organización

- `types/evento.ts`: contrato Zod, validación del formulario, adaptación de fecha/hora y permisos de presentación.
- `services/events.ts`: endpoints sobre el cliente HTTP autenticado existente y validación de respuestas.
- `hooks/useEvents.ts`: consultas y mutaciones con React Query, caché confirmada e invalidación.
- `components/events`: formulario y tarjeta responsivos con los tokens Tailwind existentes.
- `pages/EventsPage.tsx`: búsqueda, estados de pantalla y diálogos compartidos.

La caché sigue aislada por sesión mediante el proveedor existente. Las escrituras no se reintentan automáticamente. Las acciones se bloquean mientras se envían y los errores no se interpretan como listas vacías. Las respuestas confirmadas actualizan la caché antes de refrescarla.

## Comprobaciones

Ejecutar `npm test`, `npm run build`, `npm run lint` y `npm run format:check`.

Las pruebas de integración usan React Query y el cliente HTTP reales con respuestas HTTP simuladas: alta, edición, eliminación confirmada, permisos, validación, historial, errores y carga. JSDOM sustituye únicamente los métodos nativos de apertura/cierre de `dialog` que no implementa.

La validación contra Cognito y el backend desplegado requiere una cuenta con el rol correspondiente; estas pruebas no escriben en AWS ni en los datos remotos. Para revisión manual, entrar como docente y como participante, comprobar anchos móvil/escritorio, crear un evento en un proyecto propio, editar fecha/hora y cancelar o eliminar según su historial.
