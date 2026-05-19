# Perchi Demo Deploy

Demo recomendado:

- Frontend: Vercel, carpeta `frontend`
- Backend: Railway, carpeta `backend`
- Base de datos: PostgreSQL administrado en Railway

## Backend en Railway

1. Crea un proyecto en Railway.
2. Agrega un servicio PostgreSQL.
3. Agrega un servicio desde GitHub apuntando a la carpeta `backend`.
4. Variables del backend:

```txt
DATABASE_URL=<connection string de Railway Postgres>
JWT_SECRET=<clave larga aleatoria>
FRONTEND_URL=<url final de Vercel>
PORT=4000
MONTHLY_FEE_CLP=6990
```

5. Build command:

```txt
npm run build
```

6. Start command:

```txt
npm start
```

7. Despues del primer deploy, ejecuta migraciones:

```txt
npm run prisma:deploy
```

8. Opcional para cargar datos demo:

```txt
npm run db:seed
```

## Frontend en Vercel

1. Importa el repo desde GitHub.
2. Root Directory:

```txt
frontend
```

3. Build Command:

```txt
npm run build
```

4. Output Directory:

```txt
dist
```

5. Variable del frontend:

```txt
VITE_API_URL=<url del backend Railway>/api
```

## Prueba funcional

Prueba este flujo en la URL de Vercel:

1. Registrar una usuaria nueva.
2. Activar membresia demo.
3. Publicar una prenda.
4. Entrar con otra usuaria.
5. Dar me gusta y revisar `Mis me gusta`.
6. Revisar datos en PostgreSQL desde Railway o pgAdmin.
