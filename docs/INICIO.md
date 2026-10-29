# SyncPassWeb — primera etapa

React + Vite + TypeScript con login Cognito (Authorization Code y PKCE). No necesita backend local para esta etapa.

## Ejecutar

Instalar Node.js compatible con Vite (ver engines del proyecto). Desde esta carpeta:

```powershell
npm install
npm run dev
```

Abrir **http://localhost:5173/**. Usar localhost, no 127.0.0.1: Cognito compara las URLs exactas. El puerto es estricto para evitar cambios de callback silenciosos.

No hace falta crear .env: la aplicación incluye los identificadores públicos. Para personalizar, copiar .env.example a .env.local. Las variables VITE_ son públicas: nunca colocar contraseñas, tokens ni secretos.

## Configuración de Cognito

- Pool: us-east-1_qf9qh3X5q. Cliente web sin secreto: 4pp1hrlitnamn0pl2es7e8ejmn.
- Código de autorización con PKCE S256 generado por oidc-client-ts.
- Scope solicitado: openid. En Cognito, openid sin otros scopes devuelve los atributos que el cliente puede leer. El cliente debe poder leer name y email en sus permisos de atributos. Completar name en los usuarios.
- Callback: http://localhost:5173/auth/callback
- Cierre de sesión: http://localhost:5173/
- Estilo de login administrado asignado al cliente web.

La sesión se guarda en sessionStorage de esta pestaña. No se muestran tokens ni IDs. Después del login, /app queda vacía y protegida hasta implementar los dashboards.

La pantalla de cuenta y su cierre de sesión se retiraron. Se incorporará el cierre en el dashboard cuando se implemente. Los permisos definitivos siempre los valida el backend.

## Estructura

- src/auth: configuración y protección de rutas.
- src/pages: inicio público con botón Continuar con Cognito.
- src/App.tsx: rutas.

## Verificar

```powershell
npm test
npm run build
```

Prueba con una cuenta propia: iniciar desde el botón de la app, ingresar en Cognito, confirmar el retorno a /app (vacía), recargarla y comprobar en una ventana sin sesión que /app redirige al inicio. No compartir tokens ni códigos de autorización.

## Vercel, próxima etapa

Framework Vite, build npm run build, salida dist. vercel.json permite abrir rutas directamente. Registrar antes las URLs del dominio: https://DOMINIO/auth/callback y https://DOMINIO/. Los retornos usan automáticamente el origen actual.

Esta etapa no consume la API de negocio, ni modifica Android o EC2. Después habrá que aceptar el cliente web en el backend y configurar CORS, manteniendo la validación de firma, issuer, token_use y roles.
