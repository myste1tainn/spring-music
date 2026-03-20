# Story 5: Album Form Validation

**As an** end user,
**I want** the album form to validate my input before submission,
**so that** I cannot accidentally save incomplete or incorrectly formatted album data.

## Acceptance Criteria

### Frontend UI

1. **All fields required** — Open the "Add an album" modal. Leave all fields empty. The OK button is disabled (grayed out) and cannot be clicked.
2. **Title required** — Fill in artist, release year, and genre but leave title empty. The title field shows a warning icon (glyphicon-warning-sign) and the OK button remains disabled.
3. **Artist required** — Fill in title, release year, and genre but leave artist empty. The artist field shows a warning icon and the OK button remains disabled.
4. **Genre required** — Fill in title, artist, and release year but leave genre empty. The genre field shows a warning icon and the OK button remains disabled.
5. **Release year format validation** — Enter "abcd" in the release year field. The field shows a warning icon. Enter "0999". The field still shows a warning. Enter "2024". The field shows a success icon (glyphicon-ok). The valid pattern is a four-digit year starting with 1 or 2 (regex: `^[1-2]\d{3}$`).
6. **Valid form enables submission** — Fill in all four fields with valid data (e.g., title: "Test", artist: "Artist", releaseYear: "2024", genre: "Rock"). All fields show success icons and the OK button becomes enabled.
7. **Cancel discards without saving** — Fill in the form partially, then click Cancel. The modal closes. No new album appears in the grid and no "Album saved" message is shown.
8. **Validation applies to edit modal too** — Click "edit" on an existing album. Clear the title field. The OK button becomes disabled. Re-enter a title and the button re-enables.
