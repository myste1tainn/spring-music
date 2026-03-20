# Story 13: Application Health Monitoring

**As a** developer,
**I want** to access application health and metrics via Spring Boot Actuator endpoints,
**so that** I can monitor the application's runtime state and diagnose issues.

## Acceptance Criteria

### Backend API

1. **Health endpoint available** — Send `GET /actuator/health`. Response is `200 OK` with a JSON body containing `"status": "UP"` and detailed component health information (including database health).
2. **Detailed health information** — The health response includes component details (e.g., `db`, `diskSpace`) with their individual statuses, not just the top-level status. This is enabled by the `show-details: always` configuration.
3. **All actuator endpoints exposed** — Send `GET /actuator`. Response lists all available actuator endpoints. All standard endpoints (health, info, metrics, env, beans, etc.) are accessible because `management.endpoints.web.exposure.include` is set to `"*"`.
4. **Metrics endpoint available** — Send `GET /actuator/metrics`. Response is `200 OK` with a list of available metric names (e.g., `jvm.memory.used`, `http.server.requests`).
5. **Environment endpoint available** — Send `GET /actuator/env`. Response is `200 OK` with the application's environment properties, including active profiles and configuration sources.
