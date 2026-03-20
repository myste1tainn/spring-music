# Story 1: Album Catalog Management

**As an** end user,
**I want** to browse, add, edit, and delete albums in the catalog,
**so that** I can maintain an up-to-date collection of music albums.

## Acceptance Criteria

### Backend API

1. **List all albums** — Send `GET /albums`. Response is `200 OK` with a JSON array. Each element contains at minimum: `id` (string), `title`, `artist`, `releaseYear`, and `genre`.
2. **Add an album** — Send `PUT /albums` with body `{"title":"Test Album","artist":"Test Artist","releaseYear":"2024","genre":"Pop"}`. Response is `200 OK` and the returned JSON includes a system-generated `id`. A subsequent `GET /albums` includes the new album.
3. **View a single album** — Send `GET /albums/{id}` using a valid `id`. Response is `200 OK` with a JSON object containing that album's fields. Requesting a non-existent `id` returns `200` with an empty body (null).
4. **Update an album** — Send `POST /albums` with a full album JSON body including the existing `id` and a modified `title`. Response is `200 OK` with the updated album. A subsequent `GET /albums/{id}` reflects the change.
5. **Delete an album** — Send `DELETE /albums/{id}` for an existing album. Response is `200 OK`. A subsequent `GET /albums` no longer includes that album.

### Frontend UI

6. **Browse albums on page load** — Open the app root (`/`) in a browser. The page loads a grid view of album cards showing title, artist, release year, and genre for every album in the database.
7. **Add an album via modal** — Click the "+" add an album" link in the page header. A modal dialog titled "Add an album" appears with fields for title, artist, release year, and genre. Fill in valid data and click OK. A green "Album saved" success banner appears and the new album is visible in the grid.
8. **Edit an album via modal** — Click the gear icon (cog) on an album card and select "edit" from the dropdown menu. A modal titled "Edit an album" appears pre-filled with the album's current data. Modify a field and click OK. The updated value is displayed in the grid and a "Album saved" banner appears.
9. **Delete an album** — Click the gear icon on an album card and select "delete" from the dropdown. The album is removed from the display and a "Album deleted" success banner appears.
