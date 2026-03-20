# Story 11: Automatic Data Seeding on First Startup

**As a** developer,
**I want** the application to automatically populate the album catalog with sample data on first startup,
**so that** the app is immediately usable with representative content without manual data entry.

## Acceptance Criteria

### Backend API

1. **Seed data loads on empty database** — Start the app for the first time (empty database). Send `GET /albums`. The response contains exactly 29 albums loaded from the built-in seed data file (`albums.json`).
2. **Seed data includes expected albums** — After first startup, `GET /albums` includes albums such as "Nevermind" by Nirvana (1991, Rock) and "Pet Sounds" by The Beach Boys (1966, Rock), matching entries in `src/main/resources/albums.json`.
3. **Seed data contains all required fields** — Each seeded album has non-null values for `title`, `artist`, `releaseYear`, and `genre`, and a system-generated `id`.
4. **No duplicate seeding on restart** — Start the app, confirm 29 albums. Stop and restart against the same database. `GET /albums` still returns 29 albums — the populator skips seeding because `count() > 0`.
5. **Seeding respects manual additions** — Start the app (29 seeded). Add a new album via `PUT /albums`. Restart. `GET /albums` returns 30 albums (29 seeded + 1 manual). No re-seeding occurs.
6. **Seeding works with each backend** — Repeat criterion 1 with each supported profile (`mysql`, `postgres`, `mongodb`, `redis`, and default H2). In all cases, 29 seed albums are loaded on first startup against an empty database.
7. **Re-seeding after full deletion** — Start the app (29 seeded). Delete all albums via `DELETE /albums/{id}`. Restart. `GET /albums` returns 29 albums again — the populator re-seeds because `count() == 0`.

### Frontend UI

8. **UI shows seeded data immediately** — Start the app fresh. Open the root URL (`/`) in a browser. The album grid displays all 29 seeded albums with their titles, artists, release years, and genres without any prior manual action.
