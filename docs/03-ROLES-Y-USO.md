# Roles, dashboards y manual

## Roles

identity.ts normaliza los grupos de Cognito con equivalencias del backend: docente/profesor/coordinador -> DOCENTE; estudiante/alumno/monitor/recepción -> VOLUNTARIO; beneficiario/asistente -> PARTICIPANTE; administrador -> ADMIN y DOCENTE. Sin grupos reconocidos se utiliza PARTICIPANTE. El rol prioritario del dashboard es ADMIN, DOCENTE, VOLUNTARIO y PARTICIPANTE.

| Función web                   | Participante | Estudiante/voluntario     | Docente                              | ADMIN                     |
| ----------------------------- | ------------ | ------------------------- | ------------------------------------ | ------------------------- |
| Ver eventos                   | Sí           | Sí                        | Sí                                   | Sí                        |
| Gestión de proyectos          | No           | No                        | Propios                              | Todos según reglas        |
| Crear/editar eventos          | No           | No                        | Proyectos propios                    | Sí                        |
| Cancelar/eliminar eventos     | No           | No                        | Propios y restricciones de historial | Sí, con restricciones     |
| Inscribirse/ver inscripciones | Sí           | No por ese rol únicamente | No por ese rol únicamente            | No por ese rol únicamente |
| Mostrar QR personal           | Sí           | No por ese rol únicamente | No por ese rol únicamente            | No por ese rol únicamente |
| Recepción de asistencia       | No           | Sí                        | Proyectos propios                    | Sí                        |

Las cuentas con varios roles combinan permisos. El backend comprueba cada solicitud. Aunque la API permite consultar proyectos a usuarios autenticados, la sección web de gestión se ofrece a coordinación.

## Login y salida

Abrir la raíz, pulsar Continuar con Cognito y autenticarse con una cuenta de prueba. El callback vuelve al área correspondiente. Una sesión ya abierta en Cognito puede evitar que vuelva a pedir contraseña.

El saludo usa name, luego given_name/email y finalmente Usuario. No utiliza el sub como nombre. Cerrar sesión mediante el botón de la interfaz para limpiar la sesión y gestionar la salida de Cognito. No basta cambiar de URL para cambiar de usuario.

## Docente

El dashboard ofrece Proyectos, Eventos y Asistencias. ADMIN utiliza esta misma experiencia de coordinación.

### Proyectos

Entrar a Proyectos y crear un registro con nombre y datos del contrato. Editar desde la tarjeta correspondiente. Eliminar requiere confirmación; el backend rechaza proyectos con eventos asociados. Las acciones de modificación se restringen al responsable o ADMIN.

### Eventos

Entrar a Eventos y crear actividad seleccionando un proyecto por nombre. Solo se ofrecen proyectos gestionables. Completar fecha/hora separadas, cupos y ubicación opcional. Cero cupos significa sin límite. Coordenadas: ambas completas o ambas vacías.

Para editar se cargan los datos existentes. Cambiar el proyecto exige permisos sobre origen y destino. Para cancelar utilizar la edición y estado CANCELADO, conservando historial. Eliminar requiere confirmación; un evento con inscritos/presentes se conserva y se cancela según corresponda. Ante conflicto concurrente, el servidor decide y se muestra su mensaje.

Los formularios web son responsivos y utilizan controles nativos; no son el editor Android de tres pasos.

## Estudiante o voluntario

El dashboard ofrece Eventos y Asistencias. No tiene creación de proyectos o eventos por ese rol.

En Asistencias:

1. Seleccionar el evento correcto.
2. Esperar la lista de inscritos y presentes.
3. Leer el QR con cámara o seleccionar una imagen del QR.
4. Revisar el evento mostrado y pulsar Confirmar asistencia.
5. Comprobar el mensaje confirmado por el servidor y la lista actualizada.

El lector no envía la asistencia solo por detectar un código: prepara una captura que el receptor confirma. Durante el envío se bloquea el cambio de evento. Reintentar conserva el UUID de esa operación.

Docente responsable y ADMIN también pueden usar recepción. No se permite registrar la propia asistencia como receptor.

## Participante

El dashboard ofrece Eventos e Inscripciones. En Eventos puede inscribirse cuando el estado y cupos lo permitan. En Mis inscripciones se muestran actividades inscritas, presencia y QR personal.

Inscribirse no marca presente. Para asistir, presentar el QR a recepción y actualizar después para consultar el resultado. No existe un botón de automarcación ni cancelación individual de inscripción en la entrega web.

## Prueba entre PC y teléfono

Si el PC no tiene cámara, iniciar participante en la web y mostrar su QR. En el teléfono, entrar en Android como voluntario o docente responsable, abrir el evento correcto y escanear. Ambos clientes deben consumir la misma API.

La credencial personal `ESTUDIANTE_<id>` se aplica al evento seleccionado por recepción. El prefijo es histórico; su titular debe ser un participante. El QR Android vinculado `SYNC_PASS:ASISTENCIA:<eventoId>:<usuarioId>` se valida contra el evento de destino y se rechaza si es otro.

No hace falta inscribirse manualmente antes de todo escaneo: el servidor puede crear la inscripción si hay cupos y el estado lo permite.

## Errores habituales

- 401: sesión/token no válido para API; cerrar sesión y volver a entrar.
- 403: rol insuficiente o proyecto ajeno.
- 409: historial o relaciones impiden la operación.
- 422: evento cerrado, cupo agotado u otra regla del negocio.
- Sin cámara: usar una imagen del QR o escanear desde otro dispositivo.
- Sin servidor: no se confirma la escritura; refrescar después de recuperar el servicio.

Una lista con datos de caché no demuestra conexión actual. La información recibida puede quedar visible junto al aviso de error.
