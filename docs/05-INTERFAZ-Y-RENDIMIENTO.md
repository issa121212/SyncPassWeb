# Interfaz, accesibilidad y rendimiento

## Diseño visual

index.css define tokens Tailwind para colores y tipografía: primary #4f608e, contenedor #bdccff, canvas #faf8ff y tarjetas #e1e2ec. La intención es mantener afinidad con Android y una identidad azul consistente en la web. Android puede variar por su tema dinámico; no se promete igualdad de píxel entre plataformas.

Tailwind 4 se integra con @tailwindcss/vite. Las clases se aplican en componentes; CSS global contiene tokens, foco y movimiento reducido. No se utiliza Bootstrap ni Material UI.

## Adaptación de pantalla

La base es móvil. sm adapta espacios y tipografía; md transforma la navegación superior en barra lateral; lg amplía la distribución de escritorio y xl permite listas en varias columnas. Se utilizan minmax(0,1fr), min-w-0, wrap y tarjetas para controlar contenido largo.

Los puntos de quiebre estándar de Tailwind son sm 40rem, md 48rem, lg 64rem y xl 80rem. No hay una colección adicional de media queries manuales para replicar esos cambios; las variantes generan las reglas responsivas. Sí existe una regla explícita prefers-reduced-motion.

Se reduce el scroll innecesario mediante distribución y anchos máximos. No se elimina el desplazamiento de listas o diálogos. La navegación móvil puede desplazarse horizontalmente dentro de su propia lista cuando no cabe; esto es distinto de desbordar toda la página.

## Formularios

ProjectForm y EventForm usan React Hook Form, zodResolver y esquemas Zod. Campos tienen etiquetas y errores asociados. Los formularios separan fecha y hora usando input date/time; el navegador y su idioma determinan su representación visual. No se utiliza la máscara de dígitos de Android ni el editor de tres pasos.

eventPayload concatena fecha/hora y convierte números/vacíos según el contrato. Valida longitudes, rangos, cupos, radio y pares de coordenadas. El backend vuelve a validar. Los errores de API se muestran sin cerrar el formulario como si hubiera éxito.

El modal utiliza dialog.showModal, título accesible, estado aria-busy y restauración del foco al cerrar. Limita altura a 90dvh y permite scroll interno. La cancelación con Escape se controla durante envío. Los botones no envían acciones duplicadas mientras están ocupados.

## Semántica y acceso

La estructura usa encabezado, navegación, main, secciones y listas. DashboardLayout incluye enlace Ir al contenido y foco del contenido al navegar. usePageNavigation actualiza título y navegación. El foco es visible, los controles tienen nombres y los mensajes usan alert/output cuando corresponde.

Los iconos decorativos se ocultan a lectores de pantalla. Se respeta reducción de movimiento. Estas medidas son una base de accesibilidad, no una certificación WCAG ni una auditoría con todos los lectores de pantalla.

## Renderización y estado

Las páginas del área autenticada se cargan con lazy y Suspense. La página de login no necesita descargar inicialmente todo el dashboard. El lector ZXing se importa cuando se elige leer un QR. AppErrorBoundary captura errores de renderizado; no sustituye el manejo específico de errores HTTP.

QueryClient mantiene el estado remoto y una ventana staleTime de 30 segundos. Las mutaciones actualizan/invalidadan las consultas afectadas. Los proveedores se recrean por cuenta, evitando reutilizar caché de negocio de otro usuario. No se persiste esa caché en localStorage ni se usa como base offline.

Los campos/selecciones usan estado local. Las listas usan claves estables. Los efectos gestionan navegación, foco y recursos; no se añade memoización indiscriminada. StrictMode ayuda a detectar problemas de ciclo de vida en desarrollo.

## Recursos de cámara e imagen

El servicio QR libera tracks, controles y srcObject al terminar, cancelar o fallar. También maneja un permiso que termina de resolverse después de salir de la vista. Una imagen se procesa en el navegador mediante URL temporal que después se revoca; no se sube como imagen al backend. Se admite imagen de hasta 10 MB y se envía solo el contenido QR validado.

No se necesita cámara para mostrar QR personal. Abrir una cámara exige permiso y contexto seguro (HTTPS o localhost admitido por el navegador). La asistencia solo se envía después de la confirmación del receptor.

## Límites de rendimiento y conectividad

El cliente tiene timeout y cancelación y no repite escrituras automáticamente. No existe un benchmark de carga ni una promesa de renderizado instantáneo. Las listas dependen del tamaño de respuesta del servidor y no implementan virtualización/paginación completa. Si la API falla, los datos de caché pueden seguir visibles con advertencia, pero una escritura no se considera confirmada sin servidor.
