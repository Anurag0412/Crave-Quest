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

## Backend API

Start the API with `npm start` from `backend/`. All API responses are JSON. Validation errors use `{ "error": { "code": "...", "message": "..." } }`; database errors return a generic `500` response without exposing database details. IDs are positive database identifiers. List endpoints use `page` (default `1`) and `limit` (default `20`, maximum `100`).

### Endpoints

| Method and path | Behavior |
| --- | --- |
| `GET /api/outlets?page=1&limit=20` | Lists active outlets with pagination. |
| `GET /api/outlets/:outletId` | Returns an active outlet or `404`. |
| `GET /api/outlets/:outletId/menu` | Returns that outlet's current published menu entries that are listed, currently in schedule, and available by default. Supports the filters below. |
| `GET /api/dishes/:dishId` | Returns a dish only if it is listed as available on an active outlet's current published menu. |
| `POST /api/recommendations` | Ranks eligible dishes from one outlet's current available menu. |
| `POST /api/feedback` | Returns `503 feature_unavailable`; writes are disabled until authenticated identity is implemented. |
| `POST /api/discoveries` | Returns the same `503 feature_unavailable` response; writes are disabled until authenticated identity is implemented. |
| `GET /api/outlets/:outletId/analytics` | Counts recorded feedback by type and confirmed discoveries for the outlet's dishes; it does not report sales. |

Menu query parameters are `search` (dish name or description), `category`, `cuisine`, `minPrice`, `maxPrice`, `dietaryTag` (tag slug), `excludeIngredient` (ingredient name), and `availability` (`available`, `sold_out`, `paused`, or `all`). Parameters and values are validated against domain data and bound as SQL parameters. Even with `availability=all`, the menu must be current, published, listed, and inside any configured day/time availability window. Ingredient exclusion filters fail closed unless ingredient data is marked complete, contains at least one ingredient row, and every listed ingredient is verified.

Example recommendation request:

```json
{
  "outletId": 1,
  "limit": 10,
  "preferences": {
    "cuisineTypes": ["South Indian"],
    "categories": ["main"],
    "maxPrice": "15.00"
  },
  "hardRestrictions": {
    "allergens": ["peanuts"],
    "ingredients": ["sesame"],
    "dietaryTags": []
  }
}
```

Recommendations are scoped to the supplied outlet and available current published menu. Hard restrictions are evaluated before deterministic scoring; cuisine/category matches and meeting the soft `maxPrice` preference affect ranking only. The response includes `eligibleCount`, `excludedCount`, `totalAvailableCount`, per-item reason codes, and data-quality warnings. No eligible dishes returns `data: []` with HTTP 200.

Feedback and discovery writes currently return the same response without reading the request body or querying the database:

```json
{
  "error": {
    "code": "feature_unavailable",
    "message": "Feedback and discovery writes are unavailable until authentication is implemented."
  }
}
```

The response uses HTTP `503`. The schema has no authentication or account identity flow, so accepting a caller-supplied profile ID would not establish ownership. These routes cannot create records or affect analytics while disabled. Preferences and restrictions can be passed with each recommendation request; this API does not persist them or infer an identity.

### Food data and safety limits

Ingredient, allergen, and dietary claims in the demo seed are explicitly unverified. An ingredient not listed, an absent allergen mapping, or an absent dietary tag is not evidence that a dish is free from it. For an allergen restriction, recommendations exclude dishes when a verified positive association is known and also fail closed by excluding dishes whose safety cannot be verified; the schema's positive-only ingredient-to-allergen mapping cannot prove an allergen's absence. Dietary-tag restrictions likewise fail closed when the requested status cannot be established. Responses mark incomplete ingredient, allergen, and dietary data with warnings. No endpoint guarantees a dish is allergen-free or medically safe. The schema has no nutrition or serving-size fields, so those values are not returned or fabricated.

In `hardRestrictions.dietaryTags`, each supplied tag is a positive dietary requirement the dish must satisfy (for example, a requested vegan tag). A dish qualifies only when it has that tag with `verification_status = 'verified'`; a missing or unverified tag excludes the dish and adds a warning. Tags are not interpreted as labels to exclude. Because the schema records positive claims but no verified negative tag assertions, this can yield no recommendations when tag data is incomplete. To avoid an empty ingredient list being mistaken for a verified absence, ingredient exclusions also require at least one ingredient row, complete dish status, and verification for all listed rows.

### Tests and database integration

`npm test` runs the automated suite from `backend/`; `backend/test/api.test.js` uses mocked database queries. A separate, opt-in read-only PostgreSQL integration test exercises outlet/menu/recommendation/analytics reads. To run it from `backend/` in PowerShell, set `CRAVEQUEST_INTEGRATION=1` for the test process:

```powershell
$env:CRAVEQUEST_INTEGRATION = '1'
node --env-file=.env --test test/api.integration.test.js
Remove-Item Env:CRAVEQUEST_INTEGRATION
```

The integration test refuses to proceed unless the configured database is named `cravequest_dev` and PostgreSQL is version 15 or newer. It performs no writes, migrations, seeds, or table resets.

### Frontend preview and API integration

The supplied frontend is a set of static Stitch-exported HTML screens; it has no framework, router, package manifest, or build step. The existing visual assets and design tokens are preserved. A small browser API client connects outlet selection, menu browsing, recommendations, and dish details to the backend. Outlet choice and recommendation criteria live only in the current browser session. The sensory and distance controls remain visual prototypes because the API and schema do not support those preferences.

Start PostgreSQL and the backend first. From the repository root, use a second terminal to run the frontend preview server:

```powershell
node frontend/dev-server.js
```

Open `http://localhost:4173`. The preview serves the existing HTML files and forwards same-origin `/api/*` requests to `http://127.0.0.1:3000`. To use another backend origin, set `CRAVEQUEST_API_ORIGIN` before starting the preview server. The browser receives API data only; database credentials remain in the backend environment.

The home screen lists and filters current outlet menus. The Flavor Quiz passes supported category and budget preferences plus hard allergen, ingredient, and verified dietary-tag requirements to the Feed & Matches screen, which sends them to `POST /api/recommendations`. Its dietary-tag selector only offers tags marked verified by the selected outlet. The Feed & Matches screen shows API scores, reason codes, and data-quality warnings. Selecting a dish opens its live detail response. Missing ingredient, allergen, or dietary data is shown as unknown/incomplete and is never presented as proof of safety. Booking, feedback, and discovery writes are not available through the current API.

Run the frontend API client tests from the repository root:

```powershell
node frontend/test/api-client.test.js
node frontend/test/dev-server.test.js
```

These directly executable Node test files mock `fetch` and the upstream API; they do not use PostgreSQL or perform browser end-to-end checks. Run backend unit tests separately with `npm test` from `backend/`. The opt-in PostgreSQL API integration test remains read-only and must be explicitly enabled as documented above.
