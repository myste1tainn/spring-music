# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spring Music is a Spring Boot application that demonstrates storing the same domain objects in multiple persistence technologies (relational databases, MongoDB, and Redis). The application has been modernized with a React 18 frontend featuring TypeScript, Tailwind CSS, React Query, and Zustand. The backend provides a REST API with built-in Cloud Foundry integration.

### Project Status (2026-03-20)
✅ **React Frontend Modernization: Complete**
- All 12 frontend implementation tasks finished
- React 18 + TypeScript + Vite + Tailwind CSS + React Query + Zustand
- All 13 user stories implemented (CRUD, views, sorting, validation, notifications, etc.)
- Backend integration: SpaController + Gradle build automation
- Vite dev server ready for development
- Production bundle outputs to `src/main/resources/static/`

## Build and Run Commands

### Development Mode (Recommended)

#### Terminal 1: Start Spring Boot Backend
```bash
./gradlew bootRun
```
Runs Spring Boot on `http://localhost:8080` with H2 in-memory database (default). Supports profiles: `mysql`, `postgres`, `mongodb`, `redis`.

#### Terminal 2: Start React Dev Server
```bash
cd client
npm run dev
```
Runs Vite dev server on `http://localhost:5173` with hot reload. Proxy configured to forward API calls to localhost:8080.

### Production Build
```bash
npm run build        # From client/ - builds React app
./gradlew build      # From project root - builds Spring Boot JAR with bundled React frontend
```
Produces `build/libs/spring-music.jar` with React app embedded in `src/main/resources/static/`.

### Available Spring Profiles
- `mysql` - MySQL database
- `postgres` - PostgreSQL database
- `mongodb` - MongoDB database
- `redis` - Redis cache
- (no profile) - H2 in-memory database (default)

Example with profile:
```bash
java -jar -Dspring.profiles.active=mysql build/libs/spring-music.jar
```

### Testing
```bash
./gradlew test
```

Run a single test:
```bash
./gradlew test --tests ApplicationTests
```

## Architecture

### Component Structure

```
src/main/java/org/cloudfoundry/samples/music/
├── domain/           # Data model (Album entity, RandomIdGenerator)
├── repositories/     # Data access abstraction
│   ├── jpa/         # Relational database implementation
│   ├── mongodb/     # MongoDB implementation
│   ├── redis/       # Redis implementation
│   └── AlbumRepositoryPopulator.java  # Loads initial data
├── web/             # REST controllers
├── config/          # Configuration and initialization
└── Application.java # Spring Boot entry point
```

### Key Architectural Patterns

**1. Multi-Database Support via Spring Profiles**
- The application uses Spring profiles to enable different data access implementations
- Only one database profile can be active at a time; the initializer validates this
- See `SpringApplicationContextInitializer` for logic that:
  - Validates only one service profile is active
  - Auto-configures profiles when running on Cloud Foundry based on bound services
  - Excludes auto-configuration classes for unused databases (reduces startup time)

**2. Repository Pattern**
- All repositories implement `CrudRepository<Album, String>` via Spring Data abstractions
- `AlbumController` is database-agnostic; it injects a generic `CrudRepository` resolved at runtime based on active profile
- Database-specific implementations: `JpaAlbumRepository`, `MongoAlbumRepository`, `RedisAlbumRepository`

**3. Cloud Foundry Integration**
- Uses `io.pivotal.cfenv.core.CfEnv` to inspect bound services at runtime
- Automatically activates the correct profile when a database service is bound
- Maps service tags to Spring profile names (see static block in `SpringApplicationContextInitializer`)

**4. Application Initialization Flow**
- `Application.main()` creates a `SpringApplicationBuilder` with two listeners:
  - `SpringApplicationContextInitializer` - configures profiles and excludes unnecessary auto-configuration
  - `AlbumRepositoryPopulator` - loads initial album data from `albums.json` on startup

### Data Model
The `Album` entity represents a music album with fields: `id`, `title`, `artist`, `releaseYear`, `genre`, `trackCount`, and `albumId`. IDs are auto-generated using a custom `RandomIdGenerator`.

### REST API
All endpoints are prefixed with `/albums`:
- `GET /albums` - List all albums
- `GET /albums/{id}` - Get album by ID
- `PUT /albums` - Add a new album
- `POST /albums` - Update an album
- `DELETE /albums/{id}` - Delete an album

### Frontend

**React 18 with TypeScript** — Modern SPA architecture with:

```
client/
├── src/
│   ├── components/     # React components by feature
│   │   ├── layout/     # AppShell, Navbar, AppInfoDropdown
│   │   ├── albums/     # AlbumsPage, AlbumCard, AlbumRow, AlbumGridView, AlbumListView, AlbumFormModal, AlbumToolbar
│   │   ├── inline-edit/ # InlineEditField (click-to-edit)
│   │   ├── modals/     # Modal, AlbumFormModal
│   │   ├── errors/     # ErrorsPage (chaos testing)
│   │   └── ui/         # Button, Badge, Spinner, Toast, ToastContainer
│   ├── api/            # API client with error handling
│   │   ├── client.ts   # Fetch wrapper
│   │   ├── albums.ts   # Album CRUD operations
│   │   ├── info.ts     # App info endpoint
│   │   └── errors.ts   # Error simulation endpoints
│   ├── hooks/          # React Query + Zustand hooks
│   │   ├── useAlbums.ts       # CRUD mutations + toast side effects
│   │   ├── useAppInfo.ts      # App info query
│   │   └── useInlineEditor.ts # Singleton editor state
│   ├── store/          # Zustand state (viewMode, sort, toasts)
│   ├── types/          # TypeScript types (Album, AppInfo)
│   ├── utils/          # sortAlbums, validation
│   ├── App.tsx         # Router + QueryClientProvider
│   └── main.tsx        # React DOM root
├── vite.config.ts      # Vite config with proxy + output to Spring Boot static/
├── tailwind.config.ts  # Tailwind CSS configuration
├── package.json        # Dependencies + build scripts
└── index.html          # SPA entry point
```

**Tech Stack:**
- React 18 + TypeScript
- Vite bundler
- Tailwind CSS (SaaS design system)
- React Query v5 for server state
- Zustand for UI state (viewMode, sort, toasts)
- react-hook-form + zod for validation
- react-router-dom v6 for SPA routing

## Dependencies and Configuration

### Backend Dependencies
- **Spring Boot 2.4.0** with starters for web, actuator, JPA, MongoDB, and Redis
- **Spring Data**: JPA for relational DBs, MongoDB for document storage, Redis for caching
- **Java CfEnv 2.1.2**: Cloud Foundry environment detection
- **Database Drivers**: H2, MySQL, PostgreSQL, MSSQL included; Oracle requires manual setup

### Frontend Dependencies (client/package.json)
- **React 18** + ReactDOM
- **TypeScript 5.3**
- **Vite 5** (bundler)
- **Tailwind CSS 3.4** (styling)
- **React Query (@tanstack/react-query) 5.17** (server state)
- **Zustand 4.4** (UI state management)
- **react-hook-form 7.49** + **zod 3.22** (form validation)
- **react-router-dom 6.21** (SPA routing)

### Database Driver Setup
By default, H2 (in-memory) is configured. To use other databases:
- **MySQL/PostgreSQL/MSSQL**: Already included; configure datasource properties in `application.yml` or system properties
- **Oracle**: Download driver (ojdbc8.jar or ojdbc7.jar), place in `libs/` directory, uncomment corresponding line in `build.gradle`

### Management Endpoints
Actuator is enabled with all endpoints exposed (`/actuator/*`), including detailed health information. See `application.yml` for configuration.

## SPA Integration

### SpaController
Added `SpaController.java` to forward unknown paths to `index.html`. This enables React Router to handle all routes client-side:
- Routes like `/errors` are forwarded to the SPA entry point
- Static assets (JS, CSS, images) are served directly
- API calls to `/albums`, `/appinfo`, `/errors` are routed to Spring controllers

### Build Integration
- `build.gradle` includes `buildFrontend` Exec task that runs `npm run build` in the `client/` directory
- `processResources` depends on `buildFrontend`, so `./gradlew build` automatically bundles the React app
- Vite outputs to `src/main/resources/static/` for Spring Boot to serve

## Important Implementation Notes

- **Single Active Profile Requirement**: The application validates that only one database profile is active at startup. If multiple are specified, it throws `IllegalStateException`.
- **Auto-Configuration Exclusion**: To avoid initialization overhead, the initializer dynamically excludes Spring Boot auto-configuration classes for unused databases based on the active profile.
- **Custom ID Generation**: Album IDs use a custom Hibernate ID generator (`RandomIdGenerator`) that generates random string-based IDs suitable for document stores.
- **No explicit repository beans**: Repositories are resolved via Spring Data's `CrudRepository` abstraction; the correct implementation is injected based on the active profile and available classpath.
- **Inline Editor State**: Uses module-level Zustand hook (`useInlineEditor`) to track the single active editor globally, avoiding cascading re-renders.
- **API Contract**: PUT = add (no id), POST = update (with id) — non-standard but intentional to match existing backend.

## Testing Notes

- The test context loads the full Spring application (`@SpringBootTest`)
- Default test database is H2 in-memory
- Only a basic context-load test exists; add profile-specific integration tests as needed

## Cloud Foundry Deployment

When deployed to Cloud Foundry:
- The app reads bound services via CfEnv
- Automatically activates the appropriate profile (mysql, postgres, mongodb, or redis)
- Credentials are automatically extracted from the service binding
- For user-provided services, use a `uri` field in the format: `<dbtype>://<user>:<password>@<host>:<port>/<database>`

See README.md for detailed Cloud Foundry deployment instructions.
