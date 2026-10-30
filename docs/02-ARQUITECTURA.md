# Arquitectura

## Vista general

```text
Navegador
  React Router -> Pages -> Hooks -> Services -> fetch
       |            |        |
       |        Componentes  React Query (memoria)
       |
       Cognito OIDC / código + PKCE

fetch -> HTTPS API Gateway -> HTTPS Nginx en EC2
                                  -> Spring Boot -> PostgreSQL
Android --------------------------> misma API
```

SyncPassWeb es una SPA: Vercel entrega HTML, CSS y JavaScript y el navegador consume la API. El servidor Java no se ejecuta dentro del proceso de Vite ni se despliega por importar este repositorio a Vercel.

## Frontend

| Carpeta/archivo | Responsabilidad                                                        |
| --------------- | ---------------------------------------------------------------------- |
| main.tsx        | StrictMode, error boundary, AuthProvider y BrowserRouter               |
| App.tsx         | Árbol de rutas y carga diferida                                        |
| auth/           | Configuración OIDC, identidad, acceso, dashboard y logout              |
| pages/          | Pantallas de negocio y dashboards separados                            |
| layouts/        | Estructura común autenticada                                           |
| components/     | Tarjetas, formularios, diálogos y componentes de asistencia            |
| hooks/          | Coordinación de consultas/mutaciones, identidad HTTP y navegación      |
| providers/      | QueryClient y caché remota                                             |
| services/       | Cliente fetch, operaciones por entidad y lectura de QR                 |
| types/          | Esquemas Zod, tipos inferidos, validación y transformación de payloads |
| config/         | URL de API, módulos y permisos de navegación                           |
| index.css       | Tokens visuales, Tailwind y reglas globales                            |

No existe carpeta features dentro del código. Las ramas feature organizan el trabajo Gitflow.

Las páginas coordinan interacción y presentación. Los formularios utilizan React Hook Form y Zod. Los hooks invocan servicios y actualizan React Query. Los servicios convierten entradas, ejecutan HTTP y validan respuestas; no contienen JSX.

No se utiliza MVC o MVVM de Android de forma literal en React, ni una clase por cada caso de uso. La arquitectura es de componentes con separación del estado de interfaz y el estado remoto.

## Rutas

| Ruta               | Pantalla                                     |
| ------------------ | -------------------------------------------- |
| /                  | Login                                        |
| /auth/callback     | Procesamiento de autenticación y redirección |
| /app               | Dashboard según identidad                    |
| /app/proyectos     | Gestión de proyectos                         |
| /app/eventos       | Eventos y talleres                           |
| /app/inscripciones | Inscripciones y QR del participante          |
| /app/asistencias   | Recepción y asistencia                       |

RequireAuth protege el área /app. Las páginas también verifican permisos específicos. DashboardEntry selecciona DashboardDocente, DashboardEstudiante o DashboardParticipante; ADMIN utiliza coordinación. Las rutas desconocidas tienen tratamiento de navegación/ sección no disponible, no acceso a funciones nuevas.

## Recorrido: guardar un evento

EventForm valida campos y genera valores tipados. EventsPage coordina la acción. useEvents ejecuta una mutación de eventService; eventPayload une fecha/hora sin convertir a UTC. El cliente HTTP adjunta el access token. Spring valida rol, datos y propiedad y persiste en PostgreSQL. El servicio web valida la respuesta con Zod y el hook actualiza/invalida la lista. El formulario mantiene errores cuando falla la operación.

## Estado y renderización

React Query almacena estado remoto. QueryProvider crea un QueryClient por identidad autenticada; staleTime es 30 segundos y retry está desactivado para queries y mutations. Las claves incluyen entidad/evento; el aislamiento por usuario se consigue con el proveedor separado, no agregando obligatoriamente el sub en cada clave.

useState mantiene formularios y selección; useRef protege el envío de asistencia frente a pulsaciones repetidas. Las respuestas no se copian indiscriminadamente a estados locales. Las consultas reciben AbortSignal y se invalidan tras cambios relevantes.

## Backend compartido: fs2-api

El backend utiliza Java 21, Spring Boot, Spring Security y PostgreSQL. En el repositorio móvil revisado existe una copia en Backend/ con paquete histórico `com.duoc.cursos`.

- controller: rutas HTTP, validación de DTO y delegación.
- service: negocio, propiedad, cupos, inscripción y asistencia, con transacciones.
- repository: Spring Data JPA y consultas.
- model: entidades y enumeraciones.
- dto: records de solicitudes y respuestas, agrupados en ApiDtos.
- security/config: JWT, grupos, CORS y filtros.
- integration: conexión con Cognito mediante AWS SDK.
- exception: traducción de errores.

Los controladores retornan DTO, no las entidades JPA directamente. Parte del mapeo se realiza en servicios. PostgreSQL mantiene usuarios, roles, proyectos, eventos, inscripciones, asistencias y encuestas; Flyway administra migraciones.

El frontend puede anticipar validaciones, pero el servidor decide autorización y consistencia. No confiar en el nombre de un rol decodificado por el navegador para autorizar operaciones en la base de datos.

## Datos compartidos y exclusivos

Proyectos, eventos, inscripción y presencia pertenecen al servidor. El navegador conserva caché temporal y estado de sesión; no hay base Room, cola offline ni vínculo local con recintos. Las encuestas del servidor no se convierten automáticamente en una funcionalidad web por existir sus endpoints.
