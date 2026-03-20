# Story 10: Application Info and Environment Introspection

**As a** platform operator,
**I want** to view the application's active configuration and bound services,
**so that** I can verify which database profile is active and what services are connected.

## Acceptance Criteria

### Backend API

1. **View active profiles** — Send `GET /appinfo`. Response is `200 OK` with a JSON object containing a `profiles` array listing all active Spring profiles (e.g., `["mysql"]` or `[]` for default).
2. **View bound services** — Send `GET /appinfo`. The response includes a `services` array listing the names of all Cloud Foundry services bound to the application. When running locally, this array is empty.
3. **View full service details** — Send `GET /service`. Response is `200 OK` with a JSON array of service objects containing name, tags, and other Cloud Foundry service metadata. Returns an empty array when running locally.

### Frontend UI

4. **Info dropdown in header** — Click the info icon (glyphicon-info-sign) in the top-right corner of the navigation bar. A dropdown menu appears showing "Profiles:" followed by the active profiles and "Services:" followed by the bound service names.
5. **Info updates per environment** — Deploy the app with a bound MySQL service. The info dropdown shows "Profiles: mysql" and "Services: <mysql-service-name>". Redeploy with no services bound; the dropdown shows empty profiles and services.
