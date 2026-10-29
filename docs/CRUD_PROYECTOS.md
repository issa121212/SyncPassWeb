# CRUD de proyectos por API

La ruta /app/proyectos permite a docentes y administradores listar, buscar, crear, editar y eliminar proyectos usando el backend compartido con Android.

## Separación del código

- types/proyecto.ts: contrato de respuesta, formulario y validación Zod.
- services/http.ts: transporte autenticado, cancelación, timeout y errores HTTP.
- services/projects.ts: endpoints y validación de respuestas, sin React.
- hooks/useHttpClient.ts: obtiene el access token de la sesión actual.
- hooks/useProjects.ts: consultas y mutaciones con TanStack Query.
- providers/QueryProvider.tsx: caché en memoria por sesión autenticada.
- pages/ProjectsPage.tsx: estado visual y composición de la pantalla.
- components/projects: formulario y tarjeta de proyecto.
- components/Modal.tsx: diálogo nativo modal, foco y cierre con Escape.

React Hook Form utiliza campos no controlados; no modifica el estado de toda la página en cada pulsación. Se validan nombre obligatorio, longitudes, fechas de calendario y orden inicio/fin. Los errores del servidor permanecen visibles en el formulario. Los estados opcionales vacíos se convierten a null según el DTO del backend.

## Endpoints

GET /api/proyectos, POST /api/proyectos, PUT /api/proyectos/{id}, DELETE /api/proyectos/{id} y GET /api/usuarios/me.

Se envía el access token, nunca el ID token, en Authorization. No se incluyen cookies. Las escrituras no se reintentan automáticamente. La respuesta confirmada por el servidor actualiza la caché y se solicita una lista actualizada. Una consulta fallida no se interpreta como lista vacía.

La edición y eliminación se habilitan para el responsable, comprobado con el ID interno de /usuarios/me, o un administrador. Los IDs no se muestran. El backend comprueba permisos y propiedad independientemente del frontend. No se permite eliminar proyectos con eventos asociados.

## Entornos

VITE_API_BASE_URL apunta por defecto a https://yw4llkw0lb.execute-api.us-east-1.amazonaws.com/. No hace falta backend local ni adb reverse. EC2 y Learner Lab deben estar activos.

El backend admite una allowlist exacta de clientes mediante AWS_COGNITO_ALLOWED_CLIENT_IDS. Conserva Android y agrega el cliente web. CORS permite http://localhost:5173. Antes de publicar en Vercel, agregar su origen exacto en el backend y sus callback/logout en Cognito. No usar un asterisco para sustituir esta configuración.

EC2 utiliza la Elastic IP 18.211.37.221. Mientras se conserve asociada, detener e iniciar la instancia no requiere cambiar la integración de API Gateway. La URL del frontend no cambia. EC2 debe estar activa y accesible para la renovación automática del certificado de corta duración.

## Validación realizada

Pruebas automatizadas de transporte, validación, acceso por rol y dashboards. Prueba real desde el navegador con Cognito y API Gateway: lectura de proyectos existentes, creación, edición y eliminación de un proyecto temporal, retirado al terminar. No se borraron los proyectos anteriores.

Los demás módulos de negocio continúan pendientes.
