# Story 7: Multi-Database Backend Switching

**As a** platform operator,
**I want** to switch the application's persistence backend by setting a single Spring profile,
**so that** I can run the same application against different database technologies without code changes.

## Acceptance Criteria

### Backend API

1. **Default H2 in-memory backend** — Start the app with no active profile (`java -jar spring-music-1.0.jar`). Send `GET /appinfo`. The response JSON `profiles` array is empty or does not contain any database profile. Send `GET /albums` and confirm it returns album data, proving H2 is active.
2. **Activate MySQL profile** — Start the app with `-Dspring.profiles.active=mysql` and a reachable MySQL instance. Send `GET /appinfo`. The `profiles` array contains `"mysql"`. Send `GET /albums` and confirm data is served from MySQL.
3. **Activate PostgreSQL profile** — Start the app with `-Dspring.profiles.active=postgres` and a reachable PostgreSQL instance. Send `GET /appinfo`. The `profiles` array contains `"postgres"`. CRUD operations via `/albums` function correctly.
4. **Activate MongoDB profile** — Start the app with `-Dspring.profiles.active=mongodb` and a reachable MongoDB instance. Send `GET /appinfo`. The `profiles` array contains `"mongodb"`. CRUD operations via `/albums` function correctly.
5. **Activate Redis profile** — Start the app with `-Dspring.profiles.active=redis` and a reachable Redis instance. Send `GET /appinfo`. The `profiles` array contains `"redis"`. CRUD operations via `/albums` function correctly.
6. **Reject multiple database profiles** — Start the app with `-Dspring.profiles.active=mysql,postgres`. The application fails to start and logs an error containing: "Only one active Spring profile may be set among the following:" followed by the list of valid database profiles.
7. **Auto-configuration exclusion** — Start the app with `-Dspring.profiles.active=mongodb`. The application starts without errors related to DataSource or Redis connections. Verify via startup logs that unused auto-configuration classes are excluded.

### Frontend UI

8. **UI is unaffected by backend choice** — Start the app with any valid profile (e.g., `postgres`). Open the app root (`/`). The same AngularJS UI loads with identical layout, grid/list views, and add/edit/delete functionality regardless of which database backend is active.
