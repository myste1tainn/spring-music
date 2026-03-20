# Story 9: Cloud Foundry Service Auto-Detection

**As a** platform operator,
**I want** the application to automatically detect bound Cloud Foundry database services and activate the corresponding profile,
**so that** I do not need to manually configure Spring profiles when binding services.

## Acceptance Criteria

### Backend API

1. **Auto-detect MySQL service** — Bind a MySQL service instance to the app and restage. Send `GET /appinfo`. The `profiles` array contains `"mysql"` without manually setting `-Dspring.profiles.active`.
2. **Auto-detect PostgreSQL service** — Bind a PostgreSQL service instance. After restage, `GET /appinfo` shows `"postgres"` in profiles.
3. **Auto-detect MongoDB service** — Bind a MongoDB service instance. After restage, `GET /appinfo` shows `"mongodb"` in profiles.
4. **Auto-detect Redis service** — Bind a Redis service instance. After restage, `GET /appinfo` shows `"redis"` in profiles.
5. **Reject multiple bound services** — Bind two different database services (e.g., MySQL and PostgreSQL) to the app. On restage, the app fails to start with an error containing: "Only one service of the following types may be bound to this application."
6. **No service bound defaults to H2** — Deploy the app without binding any database service. The app starts with the default H2 in-memory database. `GET /appinfo` shows no database profile active.
