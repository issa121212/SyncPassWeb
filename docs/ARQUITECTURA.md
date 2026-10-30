# Criterios del frontend actual

## Responsabilidades

- pages: las tres páginas de dashboard y las pantallas públicas.
- layouts: estructura y navegación compartidas, sin peticiones de negocio.
- components: piezas visuales reutilizables y estados de interfaz.
- auth: Cognito, sesión, selección de dashboard y contexto de identidad.
- config: definición de las secciones y acceso de navegación.
- hooks: comportamiento compartido de navegación accesible.

Los permisos del frontend solo controlan la presentación. La API debe validar el access token y los permisos en cada operación. Los CRUD de proyectos y eventos se conectan a la API; asistencias e inscripciones siguen pendientes.

## React y renderizado

App define rutas y no se suscribe al contexto de autenticación. AuthBoundary maneja la carga y los errores de sesión. IdentityProvider deriva nombre y roles una vez por cambio de perfil; useIdentity consume ese valor compartido. El estado de los botones de acceso y salida permanece en sus propios componentes.

Los valores derivados no se duplican en useState ni se sincronizan mediante efectos. Las listas usan claves estables del dominio. Las tres páginas de dashboard siguen separadas y reutilizan componentes visuales.

El login carga inicialmente; el layout, la entrada del dashboard y las secciones se cargan mediante lazy y Suspense cuando se necesitan. Una frontera de errores ofrece recuperación si falla un render o la descarga de un módulo.

No se añade memo o useCallback a todos los componentes: los cálculos actuales son pequeños. Cualquier optimización adicional debe justificarse midiendo una interacción con React DevTools Profiler en una build de producción. La separación de bundles no implica por sí sola una puntuación determinada de Lighthouse.

## HTML y accesibilidad

Un main por pantalla, navegación y tarjetas como listas, títulos jerárquicos y regiones asociadas a sus encabezados. Los enlaces navegan; los botones ejecutan acciones. Los iconos decorativos se ocultan a lectores de pantalla. Los botones tienen tipo explícito y estado ocupado.

Hay enlace de salto al contenido, foco visible y actualización del título. Al cambiar de sección se enfoca el contenido principal y se vuelve al inicio del documento. La carga usa output, con semántica de estado. Se respeta prefers-reduced-motion.

## Tailwind y responsividad

La paleta azul del móvil se declara como tokens en @theme. Las clases utilitarias describen los componentes; no hay una hoja CSS duplicada por dashboard. Prettier con su plugin de Tailwind ordena las clases.

El diseño parte de móvil. sm, md, lg y xl generan media queries según el espacio disponible. No hay consultas de ancho en JavaScript ni listeners de resize. En móvil las tarjetas se apilan y el menú permite desplazamiento horizontal dentro de su propia región. En escritorio aparece la barra lateral; tiene scroll vertical para pantallas bajas. Los nombres largos pueden dividirse sin ensanchar la página.

## Comprobaciones

```powershell
npm run build
npm run lint
npm test
npm run format:check
```

TypeScript utiliza strict y comprueba accesos a índices. Oxlint comprueba reglas de Hooks, claves y reglas de accesibilidad. Estas herramientas no reemplazan probar teclado, contraste, zoom, varios tamaños de ventana y el login real.

El CRUD de proyectos incorpora contratos Zod, transporte HTTP, formularios con React Hook Form y consultas/mutaciones con TanStack Query. La caché permanece en memoria y se separa por sesión. Ver CRUD_PROYECTOS.md. La gestión de eventos reutiliza estas capas; ver GESTION_EVENTOS.md. Asistencias e inscripciones se incorporarán gradualmente.
