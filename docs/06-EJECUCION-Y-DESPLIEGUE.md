# Ejecución y despliegue

## Desarrollo local

Requiere Node.js >=22.12.0, npm, navegador moderno, acceso a Cognito y backend operativo. No es necesario Docker o PostgreSQL en el PC para consumir el backend remoto.

```powershell
git clone https://github.com/issa121212/SyncPassWeb.git
cd SyncPassWeb
git switch develop
npm ci
npm run dev
```

Abrir http://localhost:5173/ directamente en la barra de direcciones. Vite usa strictPort true: no cambia silenciosamente a otro puerto si 5173 está ocupado. Reutilizar o detener la instancia propia antes de iniciar otra.

## Variables públicas

Si se necesita personalizar el entorno, copiar .env.example a .env.local solo si no existe. Los valores predeterminados ya permiten utilizar el entorno público configurado cuando está disponible.

| Variable                  | Uso                                                            |
| ------------------------- | -------------------------------------------------------------- |
| VITE_API_BASE_URL         | URL del Gateway o backend local                                |
| VITE_COGNITO_ISSUER       | Issuer completo del user pool                                  |
| VITE_COGNITO_CLIENT_ID    | App Client público web                                         |
| VITE_COGNITO_DOMAIN       | Dominio de Hosted UI                                           |
| VITE_COGNITO_REDIRECT_URI | Opcional: callback, por defecto origen actual + /auth/callback |
| VITE_COGNITO_LOGOUT_URI   | Opcional: por defecto origen actual + /                        |

La configuración no contiene client secret. Todas las variables VITE_ son públicas en el build. Reiniciar Vite tras cambiar el entorno; para producción, reconstruir/redeployar.

## Cognito

App Client web configurado en el mismo pool que Android, con Authorization Code, PKCE y scope openid. URLs permitidas:

- Callback local: http://localhost:5173/auth/callback
- Logout local: http://localhost:5173/
- Callback producción: https://syncpassweb.vercel.app/auth/callback
- Logout producción: https://syncpassweb.vercel.app/

La URI debe coincidir exactamente. No utilizar callback Android en la web ni combinar https://http://. Un dominio preview diferente necesita su autorización específica; no asumir que todas las URLs de Vercel quedan permitidas.

## Vercel

Importar el repositorio y utilizar main como rama de producción:

- Root Directory: raíz del proyecto.
- Preset: Vite.
- Install Command: npm ci.
- Build Command: npm run build.
- Output Directory: dist.

vercel.json reescribe rutas de la SPA hacia index.html, preservando el tratamiento de assets, y agrega cabeceras de seguridad. Probar recarga directa de /app/eventos y callback después de desplegar.

La URL de la entrega es https://syncpassweb.vercel.app/. Publicar develop o una rama de trabajo como preview no modifica por sí mismo la configuración de producción. Los cambios locales no llegan a Vercel hasta publicarlos por el flujo autorizado.

## Backend EC2 compartido

El backend fs2-api no está dentro de este repositorio web. La arquitectura registrada es API Gateway HTTPS -> Nginx HTTPS en EC2 -> Spring Boot en 127.0.0.1:8080 -> PostgreSQL local en 127.0.0.1:5432.

La API pública es https://yw4llkw0lb.execute-api.us-east-1.amazonaws.com/. La integración registrada utiliza la IP elástica 18.211.37.221. Esa dirección mantiene el destino al reiniciar la instancia mientras siga asociada; no mantiene la instancia encendida.

El servicio del backend es syncpass.service, el JAR está en /opt/syncpass/backend.jar y la configuración privada en /etc/syncpass/backend.env. Cerrar SSH no lo detiene. Apagar EC2 o el Learner Lab sí interrumpe la API.

En EC2 se comprueba el servicio y sus logs con systemctl/journalctl. La renovación del certificado de Nginx debe seguir funcionando; el certificado de IP utilizado es de corta duración. No publicar la clave privada ni la configuración con contraseñas.

## CORS y clientes permitidos

Configurar en el backend los App Clients Android y web en AWS_COGNITO_ALLOWED_CLIENT_IDS. Registrar orígenes exactos en CORS_ALLOWED_ORIGINS, por ejemplo:

```dotenv
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://syncpassweb.vercel.app
CORS_ENABLED=true
CORS_ALLOW_CREDENTIALS=false
CORS_ALLOWED_HEADERS=Authorization,Content-Type
```

Los orígenes CORS no llevan barra final. Permitir los métodos necesarios. CORS es una política del navegador; los permisos del negocio se verifican con token y servicios. Tras cambiar configuración del backend, reiniciar su servicio y comprobar readiness/solicitud autenticada.

## Comprobación y diagnóstico

```powershell
npm test
npm run lint
npm run format:check
npm run build
npm run preview
```

Preview suele utilizar otro puerto: autorizar ese origen en Cognito/CORS antes de usarlo para login. No es el servidor de producción.

- Redirect mismatch: revisar callback y dominio/origen.
- 401: access token, expiración, issuer y cliente permitido.
- 403: distinguir permiso del negocio de preflight CORS.
- Service Unavailable: comprobar Lab, instancia, Nginx, Spring, PostgreSQL y certificado.
- Pantalla al recargar ruta: revisar rewrite y artefacto desplegado.
- Puerto ocupado: identificar la instancia de desarrollo existente.

En AWS Academy se debe controlar el presupuesto. EC2, almacenamiento e IPv4 pueden generar cargos; mantener una IP elástica no garantiza costo cero cuando la instancia se apaga. No se necesita infraestructura adicional para servir este frontend desde Vercel.
