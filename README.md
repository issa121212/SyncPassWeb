# SyncPassWeb

Aplicación web para gestionar proyectos comunitarios, eventos, inscripciones y asistencia. Utiliza React, TypeScript y Vite, con Amazon Cognito para autenticación y la misma API que SyncPass Android.

Frontend publicado: [syncpassweb.vercel.app](https://syncpassweb.vercel.app/).

## Funcionalidades

- Inicio y cierre de sesión con Cognito y código de autorización con PKCE.
- Dashboards separados para docente, estudiante/voluntario y participante.
- CRUD de proyectos y eventos mediante la API, con restricciones por rol y responsable.
- Inscripción y consulta de actividades personales.
- QR del participante y recepción de asistencia por cámara o imagen.
- Diseño responsivo con Tailwind, formularios validados y mensajes de error.

El backend compartido se identifica como fs2-api y está desplegado en EC2 detrás de Nginx y API Gateway. No se ejecuta dentro de Vercel. Room y la cola offline pertenecen a Android; esta aplicación web no los implementa. Las encuestas disponibles en el backend y en Android no tienen una pantalla de gestión en esta entrega web.

## Ejecutar localmente

Requiere Node.js 22.12 o superior, npm, conexión a internet y una cuenta de prueba en Cognito.

```powershell
npm ci
npm run dev
```

Abrir [http://localhost:5173/](http://localhost:5173/). El puerto está fijado: si está ocupado, identificar la instancia existente antes de iniciar otra.

Los valores públicos de API y Cognito tienen configuración predeterminada. Para personalizarlos, copiar `.env.example` a `.env.local` si no existe y editarlo. No introducir secretos en variables VITE_: se incorporan al cliente. Cognito debe autorizar el callback y logout del origen utilizado, y el backend debe estar disponible.

## Comprobaciones

```powershell
npm test
npm run lint
npm run format:check
npm run build
npm run preview
```

El build comprueba TypeScript y genera `dist/`. Preview sirve esa compilación; su origen también debe estar autorizado en Cognito y CORS para probar autenticación/API.

## Documentación

Consultar el [índice de docs](docs/README.md) para arquitectura, requisitos, roles, diferencias con Android, API, despliegue, librerías y pruebas.

La documentación describe la entrega funcional. Utilizar datos ficticios o anonimizados en demostraciones, sin publicar tokens, contraseñas ni claves.
