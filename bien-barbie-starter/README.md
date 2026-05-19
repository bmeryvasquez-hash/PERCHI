# Bien Barbie — starter full-stack

Aplicación base para una comunidad de mujeres donde cada integrante puede pagar una membresía mensual, crear su closet y publicar prendas para vender.

## Stack inicial

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Base de datos:** PostgreSQL + Prisma ORM
- **Infra local:** Docker Compose
- **Pagos:** módulo preparado para integrar Stripe/Webpay/Flow más adelante. Por ahora queda como `mock` para desarrollo.

## Estructura

```txt
bien-barbie-starter/
├─ backend/
│  ├─ prisma/schema.prisma
│  └─ src/
│     ├─ server.ts
│     ├─ prisma.ts
│     ├─ middleware/auth.ts
│     └─ routes/
│        ├─ auth.routes.ts
│        ├─ listing.routes.ts
│        └─ subscription.routes.ts
├─ frontend/
│  └─ src/
│     ├─ App.tsx
│     ├─ pages/
│     │  ├─ Home.tsx
│     │  ├─ Login.tsx
│     │  ├─ Register.tsx
│     │  ├─ Marketplace.tsx
│     │  └─ SellCloset.tsx
│     └─ styles/global.css
├─ database/init.sql
└─ docker-compose.yml
```

## Cómo ejecutar en Visual Studio Code

### 1. Abrir carpeta
Abre la carpeta `bien-barbie-starter` en Visual Studio Code.

### 2. Crear variables de entorno
Copia los archivos de ejemplo:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

En Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

### 3. Levantar base de datos

```bash
docker compose up -d postgres
```

### 4. Instalar backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

El backend quedará en:

```txt
http://localhost:4000/api/health
```

### 5. Instalar frontend
En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend quedará en:

```txt
http://localhost:5173
```

## Flujo inicial incluido

1. Registro de usuaria.
2. Login con JWT.
3. Consulta de perfil autenticado.
4. Publicación de prenda.
5. Listado de prendas activas.
6. Endpoint base para membresía mensual.

## Importante sobre comunidad exclusiva de mujeres

Si la plataforma solicitará información sensible como género, identidad o verificación de comunidad, conviene pedir solo lo estrictamente necesario, explicar el propósito, guardar consentimiento y proteger esos datos. En este starter el campo `communityRole` queda como clasificación interna simple para evitar construir una verificación invasiva en la primera versión.
