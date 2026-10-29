# SyncPassWeb — primera etapa

React + Vite + TypeScript + Tailwind CSS con login Cognito (Authorization Code y PKCE). No necesita backend local para esta etapa.

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

La sesión se guarda en sessionStorage de esta pestaña. No se muestran tokens ni IDs. Después del login, /app muestra el dashboard según los grupos de Cognito, con el nombre del usuario. Si no hay name, se usa given_name o email, nunca sub.

El dashboard incluye cierre de sesión: elimina la sesión local y redirige a /logout de Cognito. Esto no implica revocación inmediata de todos los JWT emitidos. Los grupos controlan la navegación, y los permisos definitivos siempre los valida el backend.

## Estructura

- src/auth: configuración y protección de rutas.
- src/pages: inicio público con botón Continuar con Cognito.
- src/layouts: estructura responsiva del dashboard.
- src/config/navigation.ts: secciones y permisos de navegación.
- src/pages/DashboardDocente.tsx: coordinación de proyectos y actividades.
- src/pages/DashboardEstudiante.tsx: recepción y asistencia.
- src/pages/DashboardParticipante.tsx: actividades e inscripciones.
- src/components/dashboard: presentación reutilizable de los dashboards.
- src/auth/DashboardEntry.tsx: selecciona la página según el rol principal.
- src/components: cierre de sesión.
- src/App.tsx: rutas.

## Verificar

```powershell
npm test
npm run build
```

Prueba con una cuenta propia: iniciar desde el botón de la app, ingresar en Cognito, confirmar el nombre y menú por rol, navegar entre secciones, recargar /app, cerrar sesión y comprobar que /app redirige al inicio. Probar un participante intentando abrir /app/proyectos: debe mostrarse sección no disponible. No compartir tokens ni códigos de autorización.

## Vercel, próxima etapa

Framework Vite, build npm run build, salida dist. vercel.json permite abrir rutas directamente. Registrar antes las URLs del dominio: https://DOMINIO/auth/callback y https://DOMINIO/. Los retornos usan automáticamente el origen actual.

Esta etapa no consume la API de negocio, ni modifica Android o EC2. Después habrá que aceptar el cliente web en el backend y configurar CORS, manteniendo la validación de firma, issuer, token_use y roles.

## Dashboard por rol

Se conservan los alias de CognitoRoles del backend: estudiantes y monitores son voluntarios de recepción; admin incluye docente. Los grupos desconocidos o ausentes usan participante, igual que el backend. Un usuario con varios roles ve la unión de sus secciones.

Docente: proyectos, eventos y asistencias. Voluntario: eventos y asistencias. Participante: eventos e inscripciones. Las secciones muestran un aviso de preparación; todavía no consultan ni modifican datos reales.

## Estilos responsivos

Tailwind CSS se integra mediante @tailwindcss/vite. La paleta azul basada en la captura de Android se declara en src/index.css con @theme. Se usan clases utilitarias para móvil, tablet y escritorio. En móvil el menú pasa a una fila horizontal; las tarjetas se apilan. No hay una carpeta features en el código.
