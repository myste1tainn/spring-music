# Story 12: Error Simulation and Chaos Testing

**As a** developer,
**I want** to trigger controlled application failures,
**so that** I can test error handling, recovery mechanisms, and platform resilience.

## Acceptance Criteria

### Backend API

1. **Force application exit** — Send `GET /errors/kill`. The application process terminates immediately via `System.exit(1)`. The HTTP request receives no response (connection reset). On Cloud Foundry, the platform detects the crash and restarts the instance.
2. **Force heap overflow** — Send `GET /errors/fill-heap`. The application continuously allocates large arrays until an `OutOfMemoryError` occurs, crashing the JVM.
3. **Force exception** — Send `GET /errors/throw`. The application throws a `NullPointerException` with message "Forcing an exception to be thrown". The response is `500 Internal Server Error` with error details.

### Frontend UI

4. **Kill from UI** — Navigate to `/#/errors` in the browser. The "Force Errors" page is displayed. Click the "Kill" button. The application exits and a 502 error status is shown.
5. **Throw exception from UI** — On the `/#/errors` page, click the "Throw Exception" button. A red error banner appears showing a 500 error status.
