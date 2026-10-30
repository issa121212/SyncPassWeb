# Control de asistencia y QR personal

`/app/asistencias` permite seleccionar un evento por nombre y proyecto, consultar inscritos y presentes y registrar asistencia leyendo el QR del participante. `/app/inscripciones` muestra el QR personal obtenido de la API, incluso si todavía no hay inscripciones.

## Contrato y permisos

Revisado contra SyncPass `ebc2f47`, `UsuarioController`, `UsuarioService`, `EventoController`, `EventoService` y `ApiDtos`:

- `GET /api/usuarios/me/qr`: solo PARTICIPANTE; devuelve `{ contenido: "ESTUDIANTE_{id}" }`. El contenido se genera en el backend. La web lo dibuja con `qrcode.react`; no envía la credencial a un generador remoto.
- `GET /api/eventos/{id}/asistentes`: DOCENTE, ADMIN o VOLUNTARIO. El servicio exige que el docente sea responsable del proyecto; administración y recepción pueden consultar cualquier evento.
- `POST /api/eventos/{id}/asistencias/escanear`: mismos permisos y propiedad. Envía `codigoQr`, `clientUuid`, `marcadoEn` y `esPresente: true`. La API identifica al participante desde el QR, verifica su rol, impide registrar la propia asistencia y comprueba estado y cupos.
- Si el participante todavía no está inscrito, el backend puede crear la inscripción cuando existen cupos. Registrar de nuevo una asistencia ya presente conserva el registro existente.

El selector aplica estos permisos de presentación. La carga correcta de asistentes es necesaria para habilitar el lector y el servidor vuelve a validar cada escritura. Un evento cancelado o finalizado permite consultar su historial, sin nuevas lecturas. Los participantes no pueden abrir el control de asistencia ni usar automarcación.

## Lectura y confirmación

La cámara se abre solo mediante una acción del usuario; requiere HTTPS o localhost, permiso del navegador y un dispositivo compatible. Se prefiere la cámara trasera cuando está disponible. `@zxing/browser` se carga al abrir el lector o elegir una imagen. La alternativa de archivo acepta imágenes de hasta 10 MB, las decodifica localmente y revoca su URL temporal; el archivo no se sube al backend.

El lector admite `ESTUDIANTE_{id}` y el formato anterior `SYNC_PASS:ASISTENCIA:{eventoId}:{participanteId}`. Rechaza códigos de evento, contenido ajeno y códigos vinculados a otro evento antes de enviar una solicitud. No abre enlaces del QR.

Al detectar un QR se detiene la cámara y se solicita confirmar el evento mostrado. Cada lectura crea un `clientUuid` que se conserva si hay que reintentar una respuesta incierta. No hay reintentos automáticos ni cola offline en la web. Durante el envío se bloquean el cambio de evento y las acciones repetidas. Cambiar de evento descarta la lectura y cierra la cámara, incluso si el permiso se concede después de salir.

La confirmación requiere `esPresente: true` y el ID del evento seleccionado en la respuesta del backend. Se muestra el nombre devuelto por el servidor. Después del intento se actualizan asistentes y eventos; los rechazos conservan su mensaje y nunca se anuncian como asistencia confirmada. La caché continúa aislada por sesión con el proveedor existente.

El QR personal actual es una credencial estática compatible con Android. No tiene firma ni vencimiento y no prueba presencia por sí mismo. No se incluyen tokens ni contraseñas en la imagen. No se solicitaron coordenadas porque son opcionales en el contrato y este flujo no agrega una regla de geolocalización.

## Organización

- `types/asistencia.ts`: contratos y validación de los formatos QR.
- `services/attendance.ts`: endpoints autenticados y validación de respuestas.
- `services/qrReader.ts`: adaptador de cámara e imágenes y liberación de recursos.
- `hooks/useAttendance.ts`: consultas y mutación con React Query.
- `components/attendance`: QR personal, lector y consola del evento.
- `pages/AttendancePage.tsx`: permisos, selección y composición de la pantalla.

Referencias de las bibliotecas: [qrcode.react](https://github.com/zpao/qrcode.react) y [ZXing Browser](https://github.com/zxing-js/browser).

## Verificación

Ejecutar `npm test -- --maxWorkers=1`, `npm run build`, `npm run lint` y `npm run format:check`.

Las pruebas de interacción usan el cliente HTTP y React Query existentes con respuestas simuladas y cubren permisos, listado, lectura, confirmación, rechazo, doble envío, reintento con el mismo UUID, QR personal y errores. Las pruebas del adaptador cubren la liberación de cámara, inicio cancelado y permisos resueltos después de salir, lectura única y URLs temporales de archivos.

Además se verificó en Edge con sesiones y API simuladas: QR SVG generado por la web, captura PNG y lectura real de esa imagen con ZXing, confirmación única y actualización de asistentes; diseño a 320 y 1280 px sin desbordamiento horizontal, y liberación de una cámara sintética al detener el lector. No se usaron cuentas ni datos reales en estas comprobaciones.

La prueba con Cognito, la API desplegada y una cámara física queda pendiente: iniciar sesión como participante y mostrar Mi QR en Mis inscripciones; entrar en otro dispositivo como recepción o docente responsable, seleccionar el evento, escanear y confirmar; verificar que el participante aparezca presente también desde Android. Comprobar permisos rechazados, evento cerrado y cupos agotados. No se modificó la configuración de AWS ni el backend.
