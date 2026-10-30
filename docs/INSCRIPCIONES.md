# Inscripciones a eventos

La rama `feature/inscripciones-eventos` incorpora la participación desde la web con la API compartida de SyncPass.

- En `/app/eventos`, el participante puede inscribirse si hay cupos y el evento está PROGRAMADO o EN_CURSO.
- `/app/inscripciones` muestra únicamente eventos con `inscrito: true` en la respuesta del usuario autenticado, incluidos los cancelados o finalizados.
- La inscripción no registra asistencia. El estado de asistencia se lee de `esPresente` y se actualiza al volver a consultar la API.
- Los docentes y voluntarios conservan la consulta de eventos y no reciben controles de inscripción, salvo que también tengan el rol PARTICIPANTE.

## API y seguridad

Se usa `GET /api/eventos` y `POST /api/eventos/inscribirse` con `{ "codigoQr": "…" }`, tomando el código de `qrContenido` devuelto por el servidor. La web no necesita cámara para esta operación. No se envía un identificador de usuario: la API determina al participante a partir de su access token y comprueba rol, estado y cupos. El endpoint es idempotente para una inscripción existente.

Se validan también `inscrito`, `esPresente` y `encuestaRespondida` como booleanos en las respuestas. La caché compartida de eventos se actualiza con la respuesta confirmada y se vuelve a consultar después de cada intento. Las escrituras no se reintentan automáticamente. Se bloquean envíos simultáneos y dobles clics. Una inscripción rechazada conserva el mensaje del backend; no se muestra como confirmada.

El backend actual no ofrece cancelación de una inscripción individual. Por eso no se presenta una acción para anularla. La cancelación de un evento sigue siendo responsabilidad de su docente o administrador.

## Verificación

Ejecutar `npm test -- --maxWorkers=1`, `npm run build`, `npm run lint` y `npm run format:check`.

Las pruebas de interacción comprueban inscripción, doble clic, asistencia pendiente, cupos concurrentes, estados no disponibles, rechazo por permisos, listado personal, lista vacía y acceso directo con otro rol. Usan el cliente HTTP y React Query con respuestas simuladas.

Para la prueba real: iniciar sesión como participante, abrir Eventos, inscribirse en una actividad disponible y comprobar que aparece en Mis inscripciones después de recargar. La asistencia debe seguir pendiente hasta que la registre el flujo de recepción. Revisar también móvil y escritorio. No usar una cuenta docente como sustituto de esta comprobación.
