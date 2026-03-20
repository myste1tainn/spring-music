# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spring Music is a Spring Boot application that demonstrates storing the same domain objects in multiple persistence technologies (relational databases, MongoDB, and Redis). The application includes both a REST API backend and an AngularJS frontend, with built-in Cloud Foundry integration.

## Build and Run Commands

### Building
```bash
./gradlew clean assemble
```
Produces a runnable Spring Boot JAR at `build/libs/spring-music.jar`

### Running Locally
```bash
java -jar -Dspring.profiles.active=<profile> build/libs/spring-music.jar
```

Available profiles:
- `mysql` - MySQL database
- `postgres` - PostgreSQL database
- `mongodb` - MongoDB database
- `redis` - Redis cache
- (no profile) - H2 in-memory database (default)

### Testing
```bash
./gradlew test
```

Run a single test:
```bash
./gradlew test --tests ApplicationTests
```

### Development
```bash
./gradlew bootRun
```
Runs the app in place without building a JAR. Database defaults to H2 in-memory if no profile is set.

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
AngularJS-based UI located in `src/main/resources/static/`. Uses Bootstrap 3 and multiple custom modules (albums.js, app.js, errors.js, info.js, status.js).

## Dependencies and Configuration

### Key Dependencies
- **Spring Boot 2.4.0** with starters for web, actuator, JPA, MongoDB, and Redis
- **Spring Data**: JPA for relational DBs, MongoDB for document storage, Redis for caching
- **Java CfEnv 2.1.2**: Cloud Foundry environment detection
- **Database Drivers**: H2, MySQL, PostgreSQL, MSSQL included; Oracle requires manual setup
- **Frontend**: AngularJS 1.2.16, Bootstrap 3.1.1, jQuery via Webjars

### Database Driver Setup
By default, H2 (in-memory) is configured. To use other databases:
- **MySQL/PostgreSQL/MSSQL**: Already included; configure datasource properties in `application.yml` or system properties
- **Oracle**: Download driver (ojdbc8.jar or ojdbc7.jar), place in `libs/` directory, uncomment corresponding line in `build.gradle`

### Management Endpoints
Actuator is enabled with all endpoints exposed (`/actuator/*`), including detailed health information. See `application.yml` for configuration.

## Important Implementation Notes

- **Single Active Profile Requirement**: The application validates that only one database profile is active at startup. If multiple are specified, it throws `IllegalStateException`.
- **Auto-Configuration Exclusion**: To avoid initialization overhead, the initializer dynamically excludes Spring Boot auto-configuration classes for unused databases based on the active profile.
- **Custom ID Generation**: Album IDs use a custom Hibernate ID generator (`RandomIdGenerator`) that generates random string-based IDs suitable for document stores.
- **No explicit repository beans**: Repositories are resolved via Spring Data's `CrudRepository` abstraction; the correct implementation is injected based on the active profile and available classpath.

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
