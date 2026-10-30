# Prompt inicial: adaptar SyncPass a web

Reconstrucción del planteamiento inicial para explicar el uso de IA. No es una transcripción histórica ni acredita la ejecución de estas instrucciones.

---

Tengo una aplicación Android llamada SyncPass y quiero crear su versión web, SyncPassWeb.

Antes de desarrollar, necesito que revises caso.md, el proyecto móvil y el backend de la carpeta fs2-api.

Quiero reutilizar el mismo backend y mantener los usuarios, roles y reglas del negocio. El frontend web irá en Vercel y el backend seguirá en EC2.

Explícame qué diferencias debería tener la web respecto a Android, considerando:

- React, TypeScript, Vite y Tailwind frente a Kotlin y Jetpack Compose.
- Organización en páginas, componentes, layouts, hooks y servicios.
- Dashboards separados para docente, estudiante y participante.
- Login con el mismo Cognito, pero con un cliente y URLs de retorno para la web.
- Consumo de los mismos endpoints y validación de permisos en el backend.
- Qué funciones de Room y sincronización móvil no corresponde trasladar directamente.
- Cómo adaptar las inscripciones, el QR y el registro de asistencia al navegador.
- Qué pasa si el computador no tiene cámara y cómo podría trabajar junto con el celular.
- Diseño responsivo, manteniendo los colores y la identidad de la aplicación móvil.
- Manejo del estado, renderización, carga de datos y errores.
- Configuración de CORS y despliegue en Vercel.

Distingue qué podemos reutilizar, qué debemos adaptar y qué no es necesario incluir en la primera entrega.

No agregues funcionalidades solo por hacer la web más grande. Primero dame las diferencias y una propuesta por etapas, sin modificar código todavía.
