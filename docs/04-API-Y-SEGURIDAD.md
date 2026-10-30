# API y seguridad

## Autenticación

auth/config.ts configura OIDC: Authorization Code, PKCE habilitado, scope openid, sin client secret y sin consulta adicional userInfo. El issuer es el del user pool; el dominio de login es otro endpoint. Los clientes Android y web son distintos dentro del mismo pool.

El usuario OIDC y el estado temporal se guardan en sessionStorage mediante WebStorageStateStore. La renovación silenciosa está habilitada en la biblioteca; su resultado depende de tokens y configuración Cognito. Si falla, la app gestiona la sesión y puede requerir autenticación nueva. No es una sesión cifrada mediante Keystore como Android. sessionStorage es accesible a JavaScript del mismo origen; no protege frente a XSS.

onSigninCallback limpia parámetros temporales y recupera una ruta de retorno controlada. RequireAuth protege navegación autenticada. Los roles del navegador determinan presentación; Spring Security valida criptográficamente firma, issuer, expiración, token_use y client_id del access token. El ID token se utiliza para identidad visible, no para autorizar la API.

## Cliente HTTP

services/http.ts utiliza fetch con Authorization Bearer, Accept JSON y Content-Type cuando hay cuerpo. No envía cookies (`credentials: omit`), rechaza redirecciones y limita rutas a `/api/`. Combina cancelación externa con timeout de 20 segundos.

Un DELETE 204 no intenta leer JSON. ApiError conserva status y errores por campo. Los 5xx se muestran con un mensaje genérico, sin detalles internos. Zod valida las respuestas antes de utilizarlas. No hay reintentos automáticos de escrituras que puedan duplicar acciones.

## Endpoints consumidos por la web

Base configurada: `https://yw4llkw0lb.execute-api.us-east-1.amazonaws.com/`.

| Método y ruta                               | Uso                                                       |
| ------------------------------------------- | --------------------------------------------------------- |
| GET /api/usuarios/me                        | Identidad numérica para comprobar propiedad               |
| GET /api/proyectos                          | Listado y proyectos seleccionables                        |
| POST /api/proyectos                         | Crear                                                     |
| PUT /api/proyectos/{id}                     | Editar                                                    |
| DELETE /api/proyectos/{id}                  | Eliminar sin eventos asociados                            |
| GET /api/eventos                            | Catálogo con inscritos/presentes e indicadores personales |
| POST /api/eventos                           | Crear                                                     |
| PUT /api/eventos/{id}                       | Editar o cambiar estado                                   |
| DELETE /api/eventos/{id}                    | Eliminar sin historial incompatible                       |
| POST /api/eventos/inscribirse               | Inscribir usuario actual                                  |
| GET /api/usuarios/me/qr                     | Credencial personal del participante                      |
| GET /api/eventos/{id}/asistentes            | Consultar recepción                                       |
| POST /api/eventos/{id}/asistencias/escanear | Confirmar asistencia                                      |

La API también ofrece encuestas y sincronización para otros clientes; la web no las consume en esta entrega. Los permisos efectivos se describen en [roles](03-ROLES-Y-USO.md).

## Ejemplos de solicitudes

En Postman definir baseUrl, proyectoId, eventoId y accessToken. Seleccionar el método en el control de método, sin escribir POST dentro de la URL. Usar Bearer Token y Content-Type application/json para cuerpos.

POST `{{baseUrl}}/api/proyectos`; el mismo cuerpo completo se utiliza para PUT de detalle:

```json
{
  "nombre": "Proyecto académico",
  "descripcion": "Datos ficticios para demostración",
  "areaTematica": "Tecnología",
  "unidadVecinal": "Unidad de prueba",
  "fechaInicio": "2026-12-01",
  "fechaFin": "2026-12-31",
  "estado": "PLANIFICADO"
}
```

POST `{{baseUrl}}/api/eventos`, reemplazando proyectoId por el identificador real del proyecto de prueba:

```json
{
  "proyectoId": 1,
  "nombre": "Taller académico",
  "descripcion": "Ejemplo",
  "fechaHora": "2026-12-04T14:00:00",
  "cupos": 30,
  "recinto": "Recinto ficticio",
  "direccion": null,
  "latitud": null,
  "longitud": null,
  "radioMetros": 200,
  "estado": "PROGRAMADO"
}
```

Para editar utilizar PUT `/api/eventos/{id}` con los datos completos. Cancelar cambia estado a CANCELADO; no existe un endpoint separado `/cancelar`. Estados: PROGRAMADO, EN_CURSO, FINALIZADO y CANCELADO. El payload fechaHora es LocalDateTime sin zona, no convertir a UTC.

Inscripción del participante:

```json
{ "codigoQr": "EVENTO_1" }
```

Asistencia desde un receptor autorizado, reemplazando identificadores y generando un UUID por operación:

```json
{
  "codigoQr": "ESTUDIANTE_2",
  "clientUuid": "3a4f1e3a-79c0-4b75-ae21-e9bd67d146a9",
  "marcadoEn": "2026-10-30T15:00:00Z",
  "esPresente": true
}
```

El evento de destino lo determina la URL del escaneo. Conservar el UUID al reintentar la misma captura y no reutilizarlo para otro evento/persona. Los timestamps de asistencia sí usan un instante con zona; no confundirlos con fechaHora del evento.

## Códigos y reglas

- 400: JSON/DTO inválido o QR mal formado.
- 401: falta de autenticación válida o token/cliente no permitido.
- 403: rol insuficiente, propiedad ajena o automarcación.
- 404: recurso inexistente.
- 409: relaciones, historial, capacidad incompatible o UUID conflictivo.
- 422: cupo agotado, estado cerrado o QR vinculado a otro evento.
- 429/5xx: límite o indisponibilidad; no anunciar éxito.

El backend utiliza records de error con mensaje/status/detalles para errores del negocio. Los fallos previos de autenticación pueden ser respondidos por Spring con otro cuerpo. La web no presupone un mensaje JSON válido en todos los errores.

## Seguridad del despliegue

CORS autoriza orígenes de navegador; no reemplaza JWT ni bloquea por sí solo Postman. Producción usa HTTPS y cabeceras nosniff, no-referrer y X-Frame-Options DENY definidas en vercel.json. Estas cabeceras no equivalen a una auditoría completa ni a una CSP.

Los QR son identificadores de participante, sin firma o caducidad criptográfica. La operación exige un receptor autorizado, pero el código puede copiarse. No incluir secretos en variables VITE_, logs, capturas ni ejemplos. Las credenciales de PostgreSQL y claves PEM permanecen en la infraestructura privada.
