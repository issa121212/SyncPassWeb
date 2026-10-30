# Tecnologías y librerías

Versión del proyecto: 1.0.0. Node requerido: >=22.12.0. Los rangos se toman de package.json y las versiones resueltas de package-lock.json; utilizar npm ci para reproducirlas.

## Dependencias de ejecución

| Dependencia           | Rango declarado | Versión resuelta | Responsabilidad                            |
| --------------------- | --------------- | ---------------- | ------------------------------------------ |
| @hookform/resolvers   | ^6.0.2          | 6.0.2            | Integración de validadores con formularios |
| @tanstack/react-query | ^5.105.0        | 5.105.0          | Consultas, mutaciones y caché remota       |
| @zxing/browser        | ^0.2.1          | 0.2.1            | Lectura de QR por cámara e imagen          |
| oidc-client-ts        | ^3.5.0          | 3.5.0            | Cliente OIDC y PKCE                        |
| qrcode.react          | ^4.2.0          | 4.2.0            | Generación de QR en pantalla               |
| react                 | ^19.3.1         | 19.3.1           | Componentes y renderizado declarativo      |
| react-dom             | ^19.3.1         | 19.3.1           | Montaje de la interfaz                     |
| react-hook-form       | ^7.91.0         | 7.91.0           | Estado de formularios                      |
| react-oidc-context    | ^3.3.1          | 3.3.1            | Proveedor y hooks de autenticación         |
| react-router-dom      | ^7.18.5         | 7.18.5           | Rutas SPA y navegación                     |
| zod                   | ^4.6.7          | 4.6.7            | Validación de entradas y respuestas HTTP   |

## Herramientas de desarrollo y pruebas

| Dependencia                 | Rango declarado | Versión resuelta | Responsabilidad                         |
| --------------------------- | --------------- | ---------------- | --------------------------------------- |
| @tailwindcss/vite           | ^4.3.3          | 4.3.3            | Plugin de Tailwind para Vite            |
| @testing-library/react      | ^16.3.3         | 16.3.3           | Pruebas de componentes                  |
| @testing-library/user-event | ^14.6.8         | 14.6.8           | Interacciones de usuario en pruebas     |
| @types/node                 | ^24.19.2        | 24.19.2          | Tipos de herramientas Node              |
| @types/react                | ^19.3.0         | 19.3.0           | Tipos React                             |
| @types/react-dom            | ^19.3.0         | 19.3.0           | Tipos React DOM                         |
| @vitejs/plugin-react        | ^6.1.2          | 6.1.2            | Integración React/Vite                  |
| jsdom                       | ^30.1.3         | 30.1.3           | Entorno DOM de pruebas                  |
| oxlint                      | ^1.89.0         | 1.90.0           | Análisis estático                       |
| prettier                    | ^3.9.10         | 3.9.10           | Formato                                 |
| prettier-plugin-tailwindcss | ^0.8.1          | 0.8.1            | Orden de clases Tailwind                |
| tailwindcss                 | ^4.3.3          | 4.3.3            | Estilos utilitarios y diseño responsivo |
| typescript                  | ~7.0.2          | 7.0.2            | Comprobación estática de tipos          |
| vite                        | ^8.3.5          | 8.3.5            | Servidor de desarrollo y build          |
| vitest                      | ^5.0.5          | 5.0.5            | Runner de pruebas                       |

## Plataforma y backend

fetch, AbortController, sessionStorage, MediaDevices y dialog son APIs del navegador, no paquetes npm. React Query no es una base de datos. No se utiliza Axios, Redux o Room en este frontend.

El backend compartido fs2-api utiliza Java 21, Spring Boot 4.1.1, Spring Security, Spring Data JPA, DTO record, PostgreSQL, Flyway y AWS SDK Cognito, según la copia revisada del servidor. No son dependencias de package.json y no se instalan con npm ci.

Vercel sirve el frontend estático; Cognito autentica; API Gateway enruta; Nginx y Spring Boot corren en EC2. Las versiones de paquetes de infraestructura deben comprobarse en su entorno antes de atribuirles un número.
