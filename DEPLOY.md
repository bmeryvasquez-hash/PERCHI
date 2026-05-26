# Deploy de Perchi

## Arquitectura recomendada

- Frontend: Vercel
- Backend/API: Render
- Base de datos: Neon Postgres, Supabase Postgres, Railway Postgres o Render Postgres
- Imagenes: Cloudinary

## Seguridad de claves de usuarios

Las contrasenas no se guardan como texto. El backend guarda `passwordHash` con `bcrypt` y compara contra ese hash al iniciar sesion. No ejecutes `db:seed` en produccion, porque carga usuarios demo con claves conocidas.

## 1. Crear base de datos Postgres

Crea una base Postgres administrada y copia su connection string. Debe quedar en Render como:

```env
DATABASE_URL=postgresql://...
```

Luego Render ejecutara:

```bash
npm run prisma:deploy
```

para aplicar las migraciones.

## 2. Crear Cloudinary

Crea un upload preset unsigned para la demo y configura estas variables en Render:

```env
IMAGE_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_UPLOAD_PRESET=tu-upload-preset
CLOUDINARY_FOLDER=perchi
```

## 3. Deploy backend en Render

Puedes usar `render.yaml` desde este repo o crear el servicio manualmente.

Configuracion manual:

```text
Root: repo root
Build Command: cd backend && npm install && npm run build
Pre-Deploy Command: cd backend && npm run prisma:deploy
Start Command: cd backend && npm start
```

Variables necesarias:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=una-clave-larga-privada
FRONTEND_URL=https://tu-app.vercel.app
PUBLIC_API_URL=https://tu-backend.onrender.com
IMAGE_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_UPLOAD_PRESET=...
CLOUDINARY_FOLDER=perchi
```

## 4. Deploy frontend en Vercel

El repo incluye `vercel.json`.

Variable necesaria en Vercel:

```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

Despues de crear el backend, actualiza `FRONTEND_URL` en Render con la URL final de Vercel.

## 5. Pruebas post-deploy

1. Abrir `https://tu-backend.onrender.com/api/health`.
2. Crear una cuenta nueva desde Vercel.
3. Editar perfil y subir foto.
4. Crear una publicacion con foto.
5. Entrar con otra cuenta y dar me gusta.
6. Verificar que los perfiles aparecen en Comunidad y Busqueda.

## Importante

No subas `.env` al repo. Las variables reales van en Vercel/Render, no en GitHub.
