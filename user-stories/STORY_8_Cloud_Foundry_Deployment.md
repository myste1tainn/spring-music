# Story 8: Cloud Foundry Deployment

**As a** platform operator,
**I want** to deploy the application to Cloud Foundry with a single command,
**so that** I can get the app running in a cloud environment with minimal configuration.

## Acceptance Criteria

### Backend API

1. **Deploy with cf push** — Run `cf push` from the project root. The application deploys using `manifest.yml` and starts successfully.
2. **Memory allocation** — After deployment, run `cf app spring-music`. The app is allocated 1G of memory as specified in the manifest.
3. **Random route assigned** — After deployment, the app is accessible at a randomly generated route (not a hardcoded URL), avoiding route conflicts with other deployments.
4. **Spring Auto-Reconfiguration disabled** — The manifest sets `JBP_CONFIG_SPRING_AUTO_RECONFIGURATION: '{enabled: false}'`. The app manages its own profile activation via `SpringApplicationContextInitializer` instead of relying on the buildpack's auto-reconfiguration.
5. **Application responds** — Navigate to the deployed app's URL. The app returns `200 OK` and serves the Spring Music UI.
