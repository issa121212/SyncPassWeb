# Despliegue de SyncPassWeb

## Versión 1.0.0

Incluye login con Cognito, dashboards por rol, CRUD de proyectos y eventos, inscripciones y control de asistencia mediante QR. El backend compartido permanece en EC2 detrás de API Gateway. Vercel publica únicamente el frontend.

## Configuración de Vercel

Importar el repositorio SyncPassWeb. Seleccionar la rama de producción `main`, el preset Vite, directorio raíz del repositorio, instalación `npm ci`, compilación `npm run build` y salida `dist`. Usar Node.js 24.x.

Los identificadores públicos de Cognito y el endpoint HTTPS de API Gateway ya tienen valores predeterminados. Se pueden sobrescribir con las variables de `.env.example`. No configurar contraseñas, tokens, claves AWS ni client secrets: cualquier variable VITE se incorpora al código público del navegador.

No fijar las variables de retorno y cierre de sesión a localhost en producción. Por defecto se calculan desde el origen de la web.

## Después de obtener el dominio de producción

1. En el cliente Cognito SyncPass-Web, agregar `https://<dominio>/auth/callback` como URL de retorno y `https://<dominio>/` como URL de cierre de sesión. Conservar las URLs locales para desarrollo.
2. En la configuración CORS del backend, agregar el origen exacto `https://<dominio>` a los orígenes permitidos, conservando localhost. Reiniciar el servicio del backend para aplicar el cambio.
3. Verificar que EC2 esté encendido y que API Gateway responda. El frontend desplegado no enciende la instancia.
4. Probar login y cierre de sesión, recarga directa de una ruta `/app/...`, consultas y escrituras según rol, QR y asistencia. El lector de cámara requiere permiso del navegador y HTTPS.

No autorizar indiscriminadamente todos los dominios preview de Vercel. Para pruebas de autenticación usar un dominio concreto registrado tanto en Cognito como en CORS.

`vercel.json` incluye la reescritura de las rutas de la SPA y cabeceras básicas. La publicación no sustituye la revisión de permisos del backend. La prueba de cámara física en la web requiere un equipo con cámara; la interoperabilidad web/Android se comprobó durante la revisión del control de asistencia.
