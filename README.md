# Perchi - starter full-stack

Aplicacion base para una comunidad donde cada integrante puede pagar una membresia mensual, crear su closet y publicar prendas para vender.

## Stack inicial

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Base de datos: PostgreSQL + Prisma ORM
- Infra local: Docker Compose
- Ambiente: un solo `.env` maestro en `C:\Users\HP\Desktop\Proyectos`
- Pagos: modulo preparado para integrar Stripe, Webpay o Flow mas adelante. Por ahora queda como `mock` para desarrollo.

## Estructura

```txt
Proyectos/
|-- .env
|-- perchi-starter/
|   |-- package.json
|   |-- docker-compose.yml
|   |-- backend/
|   |   |-- prisma/schema.prisma
|   |   |-- src/
|   |-- frontend/
|   |   |-- src/
|   |-- database/init.sql
```

## Ambiente raiz

El ambiente central esta en:

```txt
C:\Users\HP\Desktop\Proyectos\.env
```

Ese archivo contiene variables para web, backend, mobile, automatizaciones, integraciones, pagos, correo, archivos y observabilidad.

No se usan `.env` separados dentro de `perchi-starter`, `backend` ni `frontend`.

## Requisitos del computador

Instala antes de ejecutar el proyecto:

1. Node.js LTS
2. Docker Desktop
3. Visual Studio Code

Despues reinicia la terminal para que `node`, `npm` y `docker` queden disponibles.

## Como entrar al ambiente

```powershell
cd C:\Users\HP\Desktop\Proyectos\perchi-starter
code .
```

## Instalacion

Desde la raiz del proyecto:

```powershell
npm run install:backend
npm run install:frontend
```

## Base de datos

```powershell
npm run db:up
npm run prisma:migrate -- --name init
```


## Datos de prueba

Despues de levantar PostgreSQL y aplicar migraciones, puedes crear usuarias y prendas iniciales:

```powershell
npm.cmd run db:seed
```

Credenciales locales:

```txt
b.mery.vasquez@gmail.com / 1234
3arbie.urm@gmail.com / 1234
```

Ambas cuentas quedan activas como miembros de la comunidad, con membresia mock activa y prendas publicadas.

## Desarrollo

En una terminal:

```powershell
npm run dev:backend
```

En otra terminal:

```powershell
npm run dev:frontend
```

URLs locales:

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:4000/api/health
```

## Tareas en VS Code

Tambien puedes abrir `Terminal > Run Task...` y ejecutar:

- `db: iniciar postgres`
- `backend: instalar dependencias`
- `backend: migrar prisma`
- `backend: dev`
- `frontend: instalar dependencias`
- `frontend: dev`

## Flujo inicial incluido

1. Registro de usuaria.
2. Login con JWT.
3. Consulta de perfil autenticado.
4. Publicacion de prenda.
5. Listado de prendas activas.
6. Endpoint base para membresia mensual.

## Nota de privacidad

Si la plataforma solicita informacion sensible como genero, identidad o verificacion de comunidad, conviene pedir solo lo estrictamente necesario, explicar el proposito, guardar consentimiento y proteger esos datos.
