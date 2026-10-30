# Validación, Gitflow y uso de IA

## Comprobaciones

En la revisión documental del 30-10-2026 se ejecutó npm test: 105 pruebas aprobadas en 10 archivos. Cubren identidad, sesión, dashboards, contratos de proyectos/eventos, cliente HTTP, eventos, inscripciones, asistencia y ciclo del lector QR.

También se completaron npm run build (TypeScript y Vite), npm run lint y npm run format:check sin errores. Se verificaron los enlaces locales de la documentación y la respuesta HTTP 200 del servidor de desarrollo en localhost:5173. Esa respuesta comprueba que sirve la aplicación; no sustituye una prueba de login o de escritura en la API.

Las pruebas de interfaz usan Vitest, Testing Library y jsdom; las pruebas de HTTP utilizan respuestas controladas. No se presentan como operaciones reales de Cognito/PostgreSQL. El lector con cámara simulada verifica liberación de recursos, no garantiza que todos los dispositivos físicos funcionen.

Durante el desarrollo se realizaron pruebas manuales con el backend desplegado: login por roles, CRUD, inscripción y asistencia compartida entre QR web y Android. Se verificó el registro en el evento seleccionado. La prueba manual y los tests automatizados aportan evidencias distintas; no existe una medición de cobertura porcentual ni carga masiva.

## Repetir validaciones

```powershell
npm test
npm run lint
npm run format:check
npm run build
```

El build incluye TypeScript. Conservar package-lock.json y utilizar npm ci. Comprobar el resultado de cada comando; que Vite arranque no prueba por sí solo que login y API estén disponibles.

## Guía manual

1. Entrar como docente: verificar dashboard, proyectos, eventos y recepción.
2. Crear un proyecto y evento ficticios, editarlos y refrescar.
3. Probar otro docente: el backend debe impedir modificar recursos ajenos.
4. Entrar como participante: no debe poder usar gestión aunque intente la ruta o petición HTTP.
5. Inscribirse y comprobar que presencia sigue separada.
6. Mostrar QR; con receptor autorizado, seleccionar el evento y leer código por cámara/imagen.
7. Confirmar asistencia y refrescar ambos clientes. Verificar que no se marque otro evento.
8. Reintentar captura y comprobar ausencia de duplicados. Probar QR vinculado a otro evento.
9. Rechazar cámara o usar PC sin cámara y comprobar alternativa por imagen.
10. Cancelar un evento de prueba mediante edición; probar restricciones de eliminación sin borrar información real.
11. Interrumpir API y comprobar mensajes, formularios conservados y ausencia de éxito ficticio.
12. Probar móvil/escritorio, teclado, foco, diálogos, recarga directa y cierre de sesión.

Utilizar datos ficticios y confirmar acciones destructivas sobre registros temporales identificados.

## Límites de la entrega

- La web no incluye Room, cola offline, PWA o sincronización en segundo plano.
- Las encuestas están en el backend/Android, sin interfaz web en esta entrega.
- No hay CRUD de recintos web ni administración completa de usuarios.
- No existe cancelación individual de inscripción en el contrato consumido.
- QR sin firma/caducidad; depende de receptor autorizado y puede copiarse.
- La web no recoge GPS ni aplica geocerca.
- La caché no es un respaldo ni una confirmación actual del servidor.
- No existe actualización push entre Android y web; refrescar/invalidadar consultas.
- No se ha certificado accesibilidad, todos los navegadores o resistencia a carga masiva.
- Disponibilidad dependiente del laboratorio, infraestructura y sesión Cognito.

## Organización Gitflow

main conserva la línea estable y develop la integración. Las funcionalidades se desarrollan en ramas feature y se revisan mediante Pull Requests. El trabajo incluye autenticación, dashboards, proyectos, eventos, inscripciones y asistencia, con revisión entre integrantes.

La entrega 1.0.0 cuenta con rama release/1.0.0 y tag v1.0.0. La preparación se integró a main y a develop mediante los Pull Requests de release. Una rama hotfix sirve para correcciones urgentes de la línea estable cuando se necesite; no se afirma que se haya utilizado por describirla.

El repositorio móvil y el web tienen historiales independientes. Las contribuciones se demuestran con sus ramas y revisiones reales. Cambiar documentación local en develop no publica automáticamente una versión ni modifica producción.

## Uso de IA

La IA apoyó interpretación del caso, arquitectura, implementación, revisión, pruebas y documentación. El equipo definió flujos, permisos y preferencias visuales y realizó pruebas con sesiones reales. Las sugerencias de IA se contrastaron con el contrato del backend y resultados observables.

No se atribuyen revisiones a integrantes sin evidencia ni se inventan resultados. Un prompt reconstruido para explicar el enfoque es material explicativo, no una transcripción histórica. La documentación se mantiene según el código y el alcance de la entrega.
