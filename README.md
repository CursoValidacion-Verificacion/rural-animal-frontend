# Proyecto 3 - Rural Animal 🐄🐖🐓

### Equipo: AnguLords

### Integrantes:
- Katherine González Arias
- Carolina Ortiz Román
- Saúl López Molina
- Ronald Estiven Picado Hernández
- Andrés Torres Sánchez

### Descripción del Proyecto
Este proyecto consiste en el desarrollo de una plataforma web para la **compra, venta y subasta de animales de granja**. La aplicación permite a los usuarios registrar y gestionar publicaciones de animales, realizar transacciones, programar citas veterinarias, y participar en subastas. Con un enfoque en la experiencia del usuario, el sistema integra funcionalidades avanzadas, como un chatbot interactivo, sistema de notificaciones, y módulos de pago en línea para transacciones seguras y eficientes.

**Tecnologías principales:** Angular, Spring Boot, y MariaDB.

--- 

### Objetivo
Crear una plataforma que facilite y centralice las operaciones de compra, venta y cuidado de animales de granja, optimizando la gestión y conectividad entre los usuarios.

---

¡Bienvenidos a Rural Animal! 🌾

---

## Flujo E2E Frontend -> Backend Staging (Railway)

El workflow de E2E está en `.github/workflows/e2e-ui.yml` y se ejecuta en:
- `push` a `staging`
- `pull_request` hacia `staging`
- ejecución manual (`workflow_dispatch`)

### Variables requeridas en GitHub Secrets (repo frontend)

- `RAILWAY_STAGING_API_URL`  
  Ejemplo: `https://tu-api-staging.up.railway.app`
- `RAILWAY_STAGING_WS_URL` (opcional)  
  Si no se define, el workflow la deriva automáticamente desde `RAILWAY_STAGING_API_URL`.

### Cómo funciona

1. El workflow genera `src/assets/runtime-env.js` con las URLs de staging.
2. Playwright levanta el frontend local (`http://127.0.0.1:4200`).
3. El frontend consume el backend de Railway usando `runtime-env.js`.
4. Los tests E2E se ejecutan con `npm run test:e2e`.
