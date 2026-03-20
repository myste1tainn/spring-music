# Backend Technical Specification — Go API Service

| Field | Value |
|---|---|
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Date** | 2026-03-20 |
| **Stack** | Go 1.22+, chi, pgx/v5, mongo-driver, go-redis |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Project Structure](#2-project-structure)
3. [Data Models](#3-data-models)
4. [Repository Interface](#4-repository-interface)
5. [OpenAPI Contract](#5-openapi-contract)
6. [Handler Specifications](#6-handler-specifications)
7. [Middleware Stack](#7-middleware-stack)
8. [Configuration](#8-configuration)
9. [Error Handling](#9-error-handling)
10. [Seed Data Initialisation](#10-seed-data-initialisation)
11. [Testing Strategy](#11-testing-strategy)
12. [Dependencies](#12-dependencies)

---

## 1. Overview

This service is a Go rewrite of the Spring Music Java monolith. It exposes the same REST API surface and supports pluggable persistence backends (PostgreSQL, MySQL, MongoDB, Redis, in-memory) selected at runtime via environment variable.

The design follows a layered architecture: **handler → service → repository**. No business logic lives in handlers; no SQL or driver calls live outside repository implementations.

**Base URL:** `http://localhost:8080`

---

## 2. Project Structure

```
spring-music-api/
├── cmd/
│   └── api/
│       └── main.go                  # Wires dependencies, starts server
├── internal/
│   ├── album/
│   │   ├── model.go                 # Album, CreateAlbumRequest, UpdateAlbumRequest
│   │   ├── repository.go            # AlbumRepository interface
│   │   ├── repository_memory.go
│   │   ├── repository_postgres.go
│   │   ├── repository_mysql.go
│   │   ├── repository_mongo.go
│   │   ├── repository_redis.go
│   │   ├── service.go               # AlbumService — business rules, ID generation
│   │   └── handler.go               # HTTP handlers (chi)
│   ├── info/
│   │   ├── model.go                 # AppInfo, ServiceBinding
│   │   └── handler.go
│   ├── chaos/
│   │   └── handler.go               # kill, throw, fill-heap
│   ├── health/
│   │   └── handler.go
│   ├── middleware/
│   │   ├── request_id.go
│   │   ├── logger.go
│   │   ├── cors.go
│   │   └── recovery.go
│   └── config/
│       └── config.go                # Env-based config, LoadConfig()
├── migrations/
│   └── 001_create_albums.sql
├── seed/
│   └── albums.json
├── Dockerfile
├── docker-compose.yml
├── go.mod
└── go.sum
```

### Dependency Rule

```
handler  →  service  →  repository (interface)
                              ↓
                    repository_postgres.go
                    repository_mongo.go
                    repository_redis.go
                    repository_memory.go
```

Handlers must never import repository implementation packages directly. The concrete implementation is injected via the interface in `main.go`.

---

## 3. Data Models

### 3.1 Album

```go
// internal/album/model.go

type Album struct {
    ID          string `json:"id"                        db:"id"`
    Title       string `json:"title"       validate:"required"`
    Artist      string `json:"artist"      validate:"required"`
    ReleaseYear string `json:"releaseYear" validate:"required,len=4,numeric"`
    Genre       string `json:"genre"       validate:"required"`
    TrackCount  int    `json:"trackCount"`
    AlbumID     string `json:"albumId"`
}
```

**Field rules:**
| Field | Type | Required | Validation |
|---|---|---|---|
| `id` | string (UUID) | auto-generated | max 40 chars, set by service layer |
| `title` | string | yes | non-empty |
| `artist` | string | yes | non-empty |
| `releaseYear` | string | yes | 4-digit numeric, pattern `[1-2]\d{3}` |
| `genre` | string | yes | non-empty |
| `trackCount` | int | no | >= 0, defaults to 0 |
| `albumId` | string | no | external catalogue reference |

### 3.2 Request Bodies

```go
// Used for PUT /albums (create)
type CreateAlbumRequest struct {
    Title       string `json:"title"       validate:"required"`
    Artist      string `json:"artist"      validate:"required"`
    ReleaseYear string `json:"releaseYear" validate:"required,len=4,numeric"`
    Genre       string `json:"genre"       validate:"required"`
    TrackCount  int    `json:"trackCount"`
    AlbumID     string `json:"albumId"`
}

// Used for POST /albums (update)
type UpdateAlbumRequest struct {
    ID          string `json:"id"          validate:"required"`
    Title       string `json:"title"       validate:"required"`
    Artist      string `json:"artist"      validate:"required"`
    ReleaseYear string `json:"releaseYear" validate:"required,len=4,numeric"`
    Genre       string `json:"genre"       validate:"required"`
    TrackCount  int    `json:"trackCount"`
    AlbumID     string `json:"albumId"`
}
```

### 3.3 Info Models

```go
// internal/info/model.go

type AppInfo struct {
    Profiles []string `json:"profiles"`
    Services []string `json:"services"`
}

type ServiceBinding struct {
    Name        string            `json:"name"`
    Label       string            `json:"label"`
    Tags        []string          `json:"tags"`
    Credentials map[string]string `json:"credentials"`
}
```

### 3.4 Response Envelopes

```go
// Shared error response — all non-2xx responses use this shape
type ErrorResponse struct {
    Error   string `json:"error"`
    Message string `json:"message"`
    Code    int    `json:"code"`
}

type HealthResponse struct {
    Status  string            `json:"status"`           // "UP" | "DOWN"
    Details map[string]string `json:"details,omitempty"`
}
```

---

## 4. Repository Interface

All persistence backends implement this interface. The service layer depends only on this interface.

```go
// internal/album/repository.go

package album

import "context"

type Repository interface {
    FindAll(ctx context.Context) ([]Album, error)
    FindByID(ctx context.Context, id string) (*Album, error)
    Save(ctx context.Context, album Album) (*Album, error)
    DeleteByID(ctx context.Context, id string) error
    Count(ctx context.Context) (int64, error)
}
```

### Factory Function

```go
// cmd/api/main.go

func newRepository(cfg *config.Config) (album.Repository, error) {
    switch cfg.StorageBackend {
    case "postgres":
        return album.NewPostgresRepository(cfg.DatabaseURL)
    case "mysql":
        return album.NewMySQLRepository(cfg.DatabaseURL)
    case "mongodb":
        return album.NewMongoRepository(cfg.MongoURI)
    case "redis":
        return album.NewRedisRepository(cfg.RedisURL)
    default: // "memory"
        return album.NewMemoryRepository(), nil
    }
}
```

### Repository Behaviour Contract

| Method | Success | Not Found | Error |
|---|---|---|---|
| `FindAll` | `[]Album` (empty slice, never nil) | — | wrapped error |
| `FindByID` | `*Album` | `nil, ErrNotFound` | wrapped error |
| `Save` | `*Album` (with generated id if new) | — | wrapped error |
| `DeleteByID` | `nil` | `ErrNotFound` | wrapped error |
| `Count` | `int64 >= 0` | — | wrapped error |

```go
// Sentinel errors — defined in repository.go
var (
    ErrNotFound = errors.New("album not found")
    ErrConflict = errors.New("album already exists")
)
```

---

## 5. OpenAPI Contract

```yaml
openapi: 3.0.3
info:
  title: Spring Music API
  version: 1.0.0
  description: Album catalogue API — Go rewrite of Spring Music monolith

servers:
  - url: http://localhost:8080
    description: Local development
  - url: https://api.example.com
    description: Production (placeholder)

tags:
  - name: albums
    description: Album CRUD operations
  - name: info
    description: Application and platform info
  - name: chaos
    description: Resilience testing endpoints
  - name: health
    description: Health check

paths:
  /albums:
    get:
      tags: [albums]
      operationId: listAlbums
      summary: List all albums
      responses:
        "200":
          description: Album list
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Album"
    put:
      tags: [albums]
      operationId: createAlbum
      summary: Create a new album
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateAlbumRequest"
      responses:
        "200":
          description: Created album
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Album"
        "400":
          $ref: "#/components/responses/ValidationError"
    post:
      tags: [albums]
      operationId: updateAlbum
      summary: Update an existing album
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdateAlbumRequest"
      responses:
        "200":
          description: Updated album
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Album"
        "400":
          $ref: "#/components/responses/ValidationError"
        "404":
          $ref: "#/components/responses/NotFound"

  /albums/{id}:
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    get:
      tags: [albums]
      operationId: getAlbum
      summary: Get album by ID
      responses:
        "200":
          description: Album
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Album"
        "404":
          $ref: "#/components/responses/NotFound"
    delete:
      tags: [albums]
      operationId: deleteAlbum
      summary: Delete album by ID
      responses:
        "204":
          description: Deleted
        "404":
          $ref: "#/components/responses/NotFound"

  /appinfo:
    get:
      tags: [info]
      operationId: getAppInfo
      summary: Active profiles and bound service names
      responses:
        "200":
          description: App info
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AppInfo"

  /service:
    get:
      tags: [info]
      operationId: getServiceBindings
      summary: Full service binding details
      responses:
        "200":
          description: Service bindings
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ServiceBinding"

  /errors/kill:
    get:
      tags: [chaos]
      operationId: killApp
      summary: Force process exit (os.Exit(1))
      responses:
        "200":
          description: Never returned — process exits

  /errors/throw:
    get:
      tags: [chaos]
      operationId: throwError
      summary: Return HTTP 500
      responses:
        "500":
          $ref: "#/components/responses/InternalError"

  /errors/fill-heap:
    get:
      tags: [chaos]
      operationId: fillHeap
      summary: Allocate memory until process is killed
      responses:
        "200":
          description: Never returned — process OOMs

  /actuator/health:
    get:
      tags: [health]
      operationId: healthCheck
      summary: Service health
      responses:
        "200":
          description: Healthy
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthResponse"
        "503":
          description: Unhealthy

components:
  schemas:
    Album:
      type: object
      required: [id, title, artist, releaseYear, genre]
      properties:
        id:
          type: string
          maxLength: 40
          example: "550e8400-e29b-41d4-a716-446655440000"
        title:
          type: string
          example: "Abbey Road"
        artist:
          type: string
          example: "The Beatles"
        releaseYear:
          type: string
          pattern: "^[1-2]\\d{3}$"
          example: "1969"
        genre:
          type: string
          example: "Rock"
        trackCount:
          type: integer
          minimum: 0
          example: 17
        albumId:
          type: string
          example: "B000002UEN"

    CreateAlbumRequest:
      type: object
      required: [title, artist, releaseYear, genre]
      properties:
        title:
          type: string
        artist:
          type: string
        releaseYear:
          type: string
          pattern: "^[1-2]\\d{3}$"
        genre:
          type: string
        trackCount:
          type: integer
          minimum: 0
        albumId:
          type: string

    UpdateAlbumRequest:
      allOf:
        - $ref: "#/components/schemas/CreateAlbumRequest"
        - required: [id]
          properties:
            id:
              type: string

    AppInfo:
      type: object
      properties:
        profiles:
          type: array
          items:
            type: string
        services:
          type: array
          items:
            type: string

    ServiceBinding:
      type: object
      properties:
        name:
          type: string
        label:
          type: string
        tags:
          type: array
          items:
            type: string
        credentials:
          type: object
          additionalProperties:
            type: string

    ErrorResponse:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        code:
          type: integer

    HealthResponse:
      type: object
      properties:
        status:
          type: string
          enum: [UP, DOWN]
        details:
          type: object
          additionalProperties:
            type: string

  responses:
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            error: ALBUM_NOT_FOUND
            message: "Album with id abc123 not found"
            code: 404
    ValidationError:
      description: Request validation failed
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            error: VALIDATION_ERROR
            message: "releaseYear must be a 4-digit year"
            code: 400
    InternalError:
      description: Unexpected server error
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ErrorResponse"
          example:
            error: INTERNAL_ERROR
            message: "An unexpected error occurred"
            code: 500
```

---

## 6. Handler Specifications

### 6.1 `GET /albums`

- **Handler:** `album.Handler.List`
- **Request:** No parameters
- **Response 200:** `[]Album` — empty array `[]` when no albums exist (never `null`)
- **Errors:** 500 on repository failure

```bash
curl -X GET http://localhost:8080/albums
```

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Abbey Road",
    "artist": "The Beatles",
    "releaseYear": "1969",
    "genre": "Rock",
    "trackCount": 17,
    "albumId": "B000002UEN"
  }
]
```

---

### 6.2 `GET /albums/{id}`

- **Handler:** `album.Handler.GetByID`
- **Path param:** `id` — UUID string
- **Response 200:** `Album`
- **Response 404:** `ErrorResponse` with `error: "ALBUM_NOT_FOUND"`

```bash
curl -X GET http://localhost:8080/albums/550e8400-e29b-41d4-a716-446655440000
```

---

### 6.3 `PUT /albums` — Create

- **Handler:** `album.Handler.Create`
- **Body:** `CreateAlbumRequest` (JSON)
- **Service generates** a new UUID for `id` — any `id` in the body is ignored
- **Response 200:** saved `Album` with generated `id`
- **Response 400:** validation error

```bash
curl -X PUT http://localhost:8080/albums \
  -H "Content-Type: application/json" \
  -d '{"title":"Abbey Road","artist":"The Beatles","releaseYear":"1969","genre":"Rock","trackCount":17}'
```

---

### 6.4 `POST /albums` — Update

- **Handler:** `album.Handler.Update`
- **Body:** `UpdateAlbumRequest` — `id` field is required
- **Response 200:** updated `Album`
- **Response 400:** validation error (including missing `id`)
- **Response 404:** album not found

```bash
curl -X POST http://localhost:8080/albums \
  -H "Content-Type: application/json" \
  -d '{"id":"550e8400-e29b-41d4-a716-446655440000","title":"Abbey Road (Remaster)","artist":"The Beatles","releaseYear":"1969","genre":"Rock"}'
```

---

### 6.5 `DELETE /albums/{id}`

- **Handler:** `album.Handler.Delete`
- **Response 204:** no body
- **Response 404:** `ErrorResponse`

---

### 6.6 `GET /appinfo`

- **Handler:** `info.Handler.AppInfo`
- Returns active storage profile from `APP_PROFILE` env var and bound service names from `VCAP_SERVICES` (if present) or empty arrays

```json
{ "profiles": ["postgres"], "services": ["my-postgres-db"] }
```

---

### 6.7 `GET /service`

- **Handler:** `info.Handler.ServiceBindings`
- Parses `VCAP_SERVICES` env var (Cloud Foundry format); returns `[]` if not set

---

### 6.8 `GET /errors/kill`

- **Handler:** `chaos.Handler.Kill`
- Calls `os.Exit(1)` — no response is written
- Must log the kill event before exiting

---

### 6.9 `GET /errors/throw`

- **Handler:** `chaos.Handler.Throw`
- Returns `500 ErrorResponse{ error: "CHAOS_ERROR", message: "intentional error", code: 500 }`

---

### 6.10 `GET /actuator/health`

- **Handler:** `health.Handler.Check`
- Pings the repository (call `Count` with a 2-second timeout)
- Returns `200 { status: "UP" }` on success, `503 { status: "DOWN" }` on failure

---

## 7. Middleware Stack

Applied globally in this order on every request:

```
RequestID → Logger → CORS → Recovery → [route handler]
```

| Middleware | Package | Behaviour |
|---|---|---|
| `RequestID` | `chi/middleware` | Attach `X-Request-ID` to context and response header |
| `Logger` | `chi/middleware` or zerolog | Structured log: method, path, status, latency, request_id |
| `CORS` | `go-chi/cors` | Allowed origins from `CORS_ORIGINS` env var |
| `Recovery` | `chi/middleware` | Catch panics, return `500 ErrorResponse`, log stack trace |

### Router Setup Signature

```go
func NewRouter(
    albumHandler *album.Handler,
    infoHandler  *info.Handler,
    chaosHandler *chaos.Handler,
    healthHandler *health.Handler,
    cfg *config.Config,
) http.Handler
```

---

## 8. Configuration

All configuration is read from environment variables. No config files.

```go
// internal/config/config.go

type Config struct {
    Port           int    // PORT, default 8080
    StorageBackend string // STORAGE_BACKEND, default "memory"
                         //   values: memory | postgres | mysql | mongodb | redis
    DatabaseURL    string // DATABASE_URL, required for postgres/mysql
    RedisURL       string // REDIS_URL, required for redis
    MongoURI       string // MONGO_URI, required for mongodb
    CORSOrigins    string // CORS_ORIGINS, default "*"
    LogLevel       string // LOG_LEVEL, default "info"
    SeedDataPath   string // SEED_DATA_PATH, default "seed/albums.json"
    AppProfile     string // APP_PROFILE, default "default"
                         //   forwarded in GET /appinfo response
}

func LoadConfig() (*Config, error)
```

`LoadConfig` returns an error if a required variable is missing given the chosen `StorageBackend`.

---

## 9. Error Handling

### Standard Error Response Shape

All non-2xx responses return `application/json` with this body:

```json
{
  "error": "ALBUM_NOT_FOUND",
  "message": "Album with id abc123 not found",
  "code": 404
}
```

### Error Code Table

| Scenario | HTTP Status | `error` field | Notes |
|---|---|---|---|
| Album not found | 404 | `ALBUM_NOT_FOUND` | |
| Request body invalid JSON | 400 | `INVALID_JSON` | |
| Validation failure | 400 | `VALIDATION_ERROR` | `message` names the failing field |
| Album already exists | 409 | `ALBUM_EXISTS` | |
| Repository failure | 500 | `INTERNAL_ERROR` | Do not leak internal details |
| Panic recovered | 500 | `INTERNAL_ERROR` | Logged with stack trace |

### Handler Error Helper

```go
func respondError(w http.ResponseWriter, status int, code, message string) {
    respond(w, status, ErrorResponse{Error: code, Message: message, Code: status})
}
```

---

## 10. Seed Data Initialisation

```go
// Signature — called once from main.go after repository is ready
func SeedAlbums(ctx context.Context, repo album.Repository, path string) error
```

**Behaviour:**
1. Call `repo.Count(ctx)`. If count > 0, return immediately (no-op).
2. Read and parse JSON from `path` into `[]Album`.
3. For each album call `repo.Save(ctx, album)`.
4. Log how many albums were seeded.

**Seed file format** (`seed/albums.json`) — array of Album objects without `id` (IDs are generated on save):

```json
[
  {
    "title": "Abbey Road",
    "artist": "The Beatles",
    "releaseYear": "1969",
    "genre": "Rock",
    "trackCount": 17,
    "albumId": "B000002UEN"
  }
]
```

---

## 11. Testing Strategy

### Unit Tests

Every package under `internal/` must have a `*_test.go` file.

| Target | Method | Tool |
|---|---|---|
| Handlers | `httptest.NewRecorder` + mock repository | stdlib `net/http/httptest` |
| Service | Mock repository implementing `album.Repository` | hand-rolled or `mockery` |
| Config | Table-driven env var tests | stdlib |

Handler test contract — every handler test must assert:
1. Correct HTTP status code
2. Response body matches expected JSON (use `encoding/json` decode, not string compare)
3. Repository method was called with expected arguments

### Integration Tests

Repository integration tests run against real databases using `testcontainers-go`. One test file per backend:

- `repository_postgres_test.go` — spins up `postgres:16-alpine`
- `repository_mongo_test.go` — spins up `mongo:7`
- `repository_redis_test.go` — spins up `redis:7-alpine`

Each test covers the full CRUD cycle via the `Repository` interface.

### Contract Tests

Validate every response body against the OpenAPI schema using `kin-openapi/openapi3`:

```go
// All integration/handler tests run responses through the validator
func assertMatchesSchema(t *testing.T, schema, body)
```

### Run All Tests

```bash
go test ./...
go test ./... -race
go test ./internal/album/... -run TestRepository -v  # single package
```

---

## 12. Dependencies

```
module spring-music-api

go 1.22

require (
    github.com/go-chi/chi/v5          v5.1.0
    github.com/go-chi/cors            v1.2.1
    github.com/google/uuid            v1.6.0
    github.com/go-playground/validator/v10  v10.22.0
    github.com/jackc/pgx/v5           v5.6.0
    go.mongodb.org/mongo-driver       v1.16.0
    github.com/redis/go-redis/v9      v9.6.0
    github.com/rs/zerolog             v1.33.0
    github.com/testcontainers/testcontainers-go  v0.33.0
    github.com/getkin/kin-openapi     v0.127.0
)
```
