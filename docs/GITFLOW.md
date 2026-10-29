# Flujo de trabajo

SyncPassWeb utiliza main para versiones estables y develop para integrar funcionalidades.

Cada cambio parte de develop en una rama feature/<nombre>. Se publica la rama y se abre un Pull Request hacia develop. Se revisa el cambio y sus pruebas antes de integrarlo, conservando el historial de la rama con un merge commit.

Cuando exista una versión completa se creará release/<version> desde develop. Después de verificarla se integrará en main y develop y se etiquetará en main. Las correcciones urgentes partirán de main como hotfix/<nombre> y se integrarán en ambas ramas.

## Primera entrega

El commit inicial contiene las reglas del repositorio y esta guía. La implementación del frontend y el login, ya desarrollada localmente, se incorpora en feature/login-cognito. Esta separación organiza el trabajo existente; no representa un historial previo de desarrollo por etapas.

Validación de la funcionalidad: npm ci, npm test y npm run build. La comprobación manual del login requiere una cuenta de Cognito. No publicar tokens, contraseñas ni archivos .env.

No fusionar una feature directamente a main. No crear ramas release o hotfix ficticias para la evaluación: se usarán cuando corresponda.
