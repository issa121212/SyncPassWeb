# Prompt de desarrollo: SyncPassWeb

Solicitud estructurada con ayuda de IA a partir del [planteamiento inicial](01-PROMPT-INICIAL.md). Es material explicativo reconstruido; su inclusión en docs no ejecuta instrucciones ni demuestra que se utilizara literalmente durante el desarrollo.

---

Quiero desarrollar SyncPassWeb, la versión web de mi aplicación Android SyncPass, siguiendo las diferencias y la propuesta revisadas anteriormente.

Primero lee caso.md y revisa Android y el backend de la carpeta fs2-api. Utiliza el caso como contexto del negocio y el código como referencia de los contratos y permisos existentes.

La web debe utilizar el mismo backend, los mismos datos y las mismas reglas de negocio. No crees otro servidor ni otra base de datos. El frontend se desplegará en Vercel y el backend seguirá en EC2.

## 1. Tecnologías y organización

Utiliza React, TypeScript, Vite y Tailwind CSS. Para las rutas utiliza React Router; para autenticación OIDC, oidc-client-ts y react-oidc-context; para consultas y mutaciones, TanStack React Query.

Organiza el proyecto separando:

- pages: pantallas asociadas a rutas.
- components: elementos reutilizables y formularios.
- layouts: estructura compartida y navegación.
- hooks: lógica reutilizable y consultas.
- services: cliente HTTP y operaciones de la API.
- types: contratos de datos y validaciones.
- auth: sesión, identidad y acceso.
- config: configuración y navegación.

No concentres toda la lógica en un componente. No crees una carpeta features en el código: ese nombre lo utilizaremos para ramas de Gitflow.

## 2. Cognito y sesión

Usa el mismo user pool de Android con un App Client público específico para la web, sin client secret y con código de autorización y PKCE.

La pantalla inicial debe ser sencilla: marca SyncPass y botón Continuar con Cognito.

Procesa el retorno en /auth/callback, limpia los parámetros temporales y dirige al dashboard correspondiente. Protege las rutas, gestiona carga y errores y permite cerrar sesión.

Muestra el name de Cognito en el saludo. No muestres el identificador técnico como nombre ni tokens en pantalla o registros.

No mezcles información de cuentas al cambiar de usuario. Define cómo se conserva la sesión y cómo se resuelve su expiración.

## 3. Dashboards y permisos

Crea páginas separadas para docente, estudiante o voluntario y participante, compartiendo los componentes que corresponda.

Comprueba las equivalencias de grupos del backend. El grupo estudiante puede corresponder a VOLUNTARIO; no inventes permisos basándote solo en su nombre.

El docente debe acceder a proyectos, eventos y asistencia. Solo puede modificar los recursos que administra, salvo los permisos adicionales de ADMIN.

El estudiante o voluntario debe acceder a eventos y recepción de asistencia, sin controles docentes por ese rol únicamente.

El participante debe consultar eventos, inscribirse, ver sus inscripciones y presentar su QR. No debe confirmar su propia asistencia.

La interfaz debe reflejar los permisos, pero el backend debe seguir validando cada solicitud. Diferencia autenticación inválida, como 401, de falta de permisos, como 403.

## 4. Proyectos y eventos

Implementa los CRUD de proyectos y eventos mediante los endpoints existentes.

Permite crear, consultar, editar y eliminar según rol, propiedad y reglas de negocio. Para cancelar un evento, utiliza el cambio de estado que admite la API, conservando el historial.

Muestra nombres de proyectos y responsables en lugar de identificadores como texto principal.

En los formularios de eventos:

- Selecciona proyectos por nombre y según permisos.
- Separa fecha y hora.
- Utiliza controles web adecuados y valida su contenido.
- Respeta LocalDateTime del backend sin convertirlo automáticamente a UTC.
- Valida cupos, longitudes y coordenadas.
- Informa los conflictos que devuelve el servidor.
- Pide confirmación antes de eliminar.
- Evita envíos repetidos y conserva los valores si falla el guardado.

No elimines automáticamente relaciones para evitar las restricciones del backend.

## 5. Inscripciones y asistencia

Implementa inscripción y consulta de actividades personales. Distingue inscrito de presente y respeta cupos, estados y duplicados.

El participante debe poder mostrar su QR sin incluir contraseñas ni tokens.

El receptor autorizado debe seleccionar el evento, leer el QR, revisar la captura y confirmar la asistencia. Solo muestra éxito después de la respuesta válida del servidor.

La asistencia debe quedar asociada al evento seleccionado, no a todos los eventos. Conserva el identificador de la operación cuando se reintente una misma captura.

Permite lectura mediante cámara del navegador o una imagen del QR. Gestiona permisos, ausencia de cámara, errores y liberación de recursos.

Debe poder mostrarse el QR en la web desde un PC y escanearse con Android en un teléfono. Ambos clientes consumirán la misma API.

No agregues cancelación individual de inscripciones u otras operaciones si el backend no ofrece su contrato.

## 6. Diferencias de alcance con Android

Esta web trabaja con la API: no necesita Room, CRUD local de recintos ni cola offline. La caché de React Query no debe presentarse como persistencia equivalente a Room.

Si la API no está disponible, informa el problema y no simules una escritura exitosa.

Las encuestas que ya existen en Android y el backend no forman parte de la primera entrega web. No las muestres como una función disponible si no existe su pantalla.

No copies el formulario Android de manera literal. Adapta el uso al navegador y a sus controles.

## 7. Diseño y buenas prácticas

Mantén los colores azules y fondos claros de la identidad de SyncPass.

Utiliza Tailwind con enfoque mobile first, distribución adecuada para escritorio y componentes reutilizables. Evita desbordamiento horizontal y scroll innecesario, conservando desplazamiento cuando sea necesario para contenido o accesibilidad.

Utiliza HTML semántico, etiquetas asociadas a campos, foco visible, navegación por teclado y mensajes claros.

Separa el estado remoto del estado de formularios. Actualiza o invalida consultas después de las operaciones. Cuida las claves de listas, los efectos y la limpieza de recursos; no añadas memoización sin una razón concreta.

## 8. API, configuración y despliegue

Centraliza las solicitudes y adjunta el access token. Valida entradas y respuestas y gestiona errores de red, permisos, validación y conflictos.

Las variables de Vite son públicas: no incluyas secretos, claves AWS, contraseñas o credenciales de PostgreSQL. Incluye .env.example.

Prepara el frontend para Vercel con build de Vite, salida dist y reescritura de rutas de SPA.

Configura los callbacks y logout de Cognito para localhost y producción. Comprueba CORS y los clientes permitidos del backend compartido sin romper Android.

No despliegues el backend Java en Vercel. Mantén la comunicación navegador -> API Gateway -> Nginx HTTPS -> Spring Boot en EC2 -> PostgreSQL.

No publiques ni crees recursos con costo sin una instrucción específica.

## 9. Pruebas y Gitflow

Prueba autenticación, roles, dashboards, formularios, cliente HTTP, CRUD, inscripción y asistencia. Comprueba también diseño responsivo y navegación directa a rutas internas.

Ejecuta pruebas, TypeScript, lint, formato y build. Distingue las pruebas con respuestas simuladas de las realizadas con el backend real. No inventes resultados.

Organiza el trabajo con main, develop, ramas feature y Pull Requests para revisión entre integrantes. Utiliza release y tags para identificar entregas cuando corresponda.

No subas ni fusiones cambios sin indicación. Quiero revisar localmente antes de publicar.

## 10. Documentación de la entrega

Cuando termines, revisa el código final y genera un README principal y documentación en docs.

Incluye:

- Problemática y contexto de caso.md.
- Requisitos funcionales y no funcionales.
- Arquitectura del frontend y del backend compartido.
- Diferencias con Android.
- Dashboards, permisos y manual de uso.
- API, seguridad y manejo de errores.
- Diseño responsivo, accesibilidad y rendimiento.
- Tecnologías y versiones reales.
- Ejecución local y despliegue en Vercel/EC2.
- Pruebas y resultados comprobados.
- Organización mediante Gitflow y apoyo de IA.

Redacta la documentación como una entrega final, sin notas temporales sobre fusiones pendientes. Conserva las limitaciones reales y no presentes metas del caso como resultados medidos.

Primero confirma la comprensión y el plan. Después desarrolla por etapas, explicando qué cambió y cómo se comprobó. Utiliza español claro y Markdown sencillo.
