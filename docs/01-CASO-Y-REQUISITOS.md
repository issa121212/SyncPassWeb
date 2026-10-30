# Caso, alcance y requisitos

## Problemática

[caso.md](caso.md) describe la gestión de actividades comunitarias con planillas dispersas, asistencia en papel, encuestas tardías y consolidación manual. Esto genera pérdida de evidencia, demoras y poca trazabilidad. SyncPassWeb adapta al navegador los procesos centrales de SyncPass Android y comparte su backend.

Los actores son docente/coordinación, estudiante voluntario/recepción y participante/beneficiario. ADMIN es un rol técnico adicional. La solución es académica; usar datos ficticios o anonimizados.

Las metas del caso sobre tiempos de acreditación, porcentajes de satisfacción, ahorro administrativo o disponibilidad no son resultados medidos por esta web.

## Diferencias con Android

| Aspecto           | SyncPass Android                           | SyncPassWeb                                               |
| ----------------- | ------------------------------------------ | --------------------------------------------------------- |
| Interfaz          | Kotlin, Compose, Material 3                | React, TypeScript, Tailwind                               |
| Navegación        | Pantallas nativas                          | React Router y URLs                                       |
| Dashboards        | Inicio con secciones por rol               | Tres páginas separadas con layout común                   |
| Persistencia      | Room, caché y operaciones pendientes       | Datos remotos y caché React Query en memoria              |
| CRUD local        | Recintos                                   | No existe equivalente local en esta entrega               |
| Conectividad      | Algunas capturas pueden quedar pendientes  | Escrituras requieren confirmación de la API               |
| QR                | Generación y escaneo nativo                | QR en pantalla, cámara del navegador o imagen local       |
| Formato de evento | Editor por pasos y separadores automáticos | Campos nativos date/time y formulario responsivo          |
| Autenticación     | Callback de esquema Android                | Callback HTTP local o HTTPS web                           |
| Encuestas         | Respuesta y consulta según permisos        | Sin pantalla de encuestas; backend conserva esa capacidad |
| Entrega           | APK                                        | Archivos estáticos en Vercel                              |
| Datos de negocio  | Backend compartido                         | Mismo backend y PostgreSQL                                |

Actualizar cada cliente permite consultar los cambios del otro; no existe un canal de actualización instantánea entre dispositivos.

## Requisitos funcionales

Los requisitos corresponden a la entrega. La evidencia se encuentra bajo `src/`.

| ID    | Actor y condición               | Resultado                                              | Evidencia                            |
| ----- | ------------------------------- | ------------------------------------------------------ | ------------------------------------ |
| RF-01 | Usuario con cuenta Cognito      | Inicia sesión con código y PKCE                        | auth/config.ts, AuthBoundary         |
| RF-02 | Usuario autenticado             | Recibe dashboard y navegación según roles              | DashboardEntry, identity.ts          |
| RF-03 | Usuario autenticado             | Ve nombre legible y cierra sesión                      | displayName, SignOutButton           |
| RF-04 | Docente/ADMIN                   | Consulta y crea proyectos                              | ProjectsPage, services/projects.ts   |
| RF-05 | Responsable/ADMIN               | Edita y elimina proyecto según reglas                  | ProjectForm, permisos y API          |
| RF-06 | Usuario autenticado             | Consulta eventos                                       | EventsPage, useEvents                |
| RF-07 | Docente responsable/ADMIN       | Crea y edita eventos                                   | EventForm, eventPayload              |
| RF-08 | Docente responsable/ADMIN       | Cancela mediante edición y elimina si no hay historial | Estado CANCELADO, DELETE             |
| RF-09 | Participante                    | Se inscribe según cupo/estado                          | EventRegistration                    |
| RF-10 | Participante                    | Consulta inscripciones y presencia propia              | RegistrationsPage                    |
| RF-11 | Participante                    | Muestra QR personal sin tokens                         | PersonalQr                           |
| RF-12 | Receptor autorizado             | Selecciona evento y lee QR                             | AttendancePage, QrInput              |
| RF-13 | Receptor autorizado             | Confirma asistencia y consulta lista                   | AttendanceConsole, useAttendance     |
| RF-14 | Usuario                         | Recibe errores y estados de carga sin éxito ficticio   | services/http.ts, PageLoading        |
| RF-15 | Usuario con varios dispositivos | Consulta datos compartidos al refrescar                | API común, invalidación de consultas |

No se incluye CRUD de usuarios, recintos locales, cancelación individual de inscripción, exportación de reportes ni formulario de encuestas web.

## Requisitos no funcionales

| ID     | Requisito                       | Implementación y límite                                                                  |
| ------ | ------------------------------- | ---------------------------------------------------------------------------------------- |
| RNF-01 | Separación de responsabilidades | Pages, componentes, hooks, servicios y esquemas                                          |
| RNF-02 | Autenticación                   | OIDC/PKCE, rutas protegidas, access token validado en servidor                           |
| RNF-03 | Autorización                    | UI condicionada y decisión final en backend                                              |
| RNF-04 | Aislamiento de cuentas          | QueryProvider por identidad; sin caché persistente de negocio                            |
| RNF-05 | Transporte seguro               | HTTPS en producción, CORS exacto y sin cookies en API                                    |
| RNF-06 | Diseño responsivo               | Tailwind, grids adaptables y navegación según ancho                                      |
| RNF-07 | Accesibilidad                   | Semántica, foco visible, etiquetas, mensajes y diálogo nativo; sin auditoría integral    |
| RNF-08 | Rendimiento                     | Rutas y lector QR diferidos; caché de 30 segundos; sin benchmark formal                  |
| RNF-09 | Resiliencia                     | Timeout de 20 segundos, cancelación y errores controlados; sin modo offline de escritura |
| RNF-10 | Verificabilidad                 | Vitest, Testing Library, TypeScript, lint y build                                        |
| RNF-11 | Portabilidad                    | Node declarado, lockfile, configuración por entorno y build estático                     |
| RNF-12 | Disponibilidad                  | Depende de Vercel, Cognito, EC2 y Learner Lab; sin SLA propio                            |

La web no hereda automáticamente todas las condiciones de uso móvil del caso. No se afirma disponibilidad absoluta sin conexión ni compatibilidad con todos los navegadores.
