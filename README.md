# CraveQuest

## Backend and PostgreSQL setup

The backend requires Node.js 20.6 or newer and PostgreSQL 15 or newer. Create a development database and a PostgreSQL role with permission to create tables in its `public` schema. The application reads `DATABASE_URL` from the process environment and never prints it.

From the repository root, install backend dependencies and create a local environment file:

```powershell
cd backend
npm ci
Copy-Item ..\.env.example ..\.env
```

Edit the copied `.env` and replace the example database username, password, host, and database name. URL-encode special characters in the username or password. `.env` is ignored by Git; `.env.example` contains placeholders only.

Apply the SQL migration explicitly, then start the service:

```powershell
npm run db:migrate:local
npm run start:local
```

The migration runner records each filename and SHA-256 checksum in `public.schema_migrations`, applies each new migration in a transaction, serializes concurrent migration runs with a PostgreSQL advisory lock, and refuses to run an already-applied migration whose contents have changed. The server does not run migrations on startup. The demo seed is not run automatically; run it manually only in a development database after reviewing its warnings.

`GET /health` checks PostgreSQL with `SELECT 1`. It returns HTTP 200 when the database is reachable and HTTP 503 with a sanitized response when it is not. Production can provide `DATABASE_URL` and optional `PORT` directly through its environment and run `npm start` without a `.env` file. `SIGINT` and `SIGTERM` stop accepting HTTP connections, allow up to five seconds for active requests to finish, then close remaining HTTP connections. The database pool gets up to two additional seconds to close; if it remains stuck, the process exits so an in-flight database query cannot hold shutdown open indefinitely.

Run backend unit tests with `npm test` from `backend/`.
