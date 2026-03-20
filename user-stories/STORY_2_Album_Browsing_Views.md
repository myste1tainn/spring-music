# Story 2: Album Browsing Views

**As an** end user,
**I want** to switch between a grid view and a list view of albums,
**so that** I can choose the layout that best fits my browsing preference.

## Acceptance Criteria

### Frontend UI

1. **Default grid view** — Open the app root (`/`). Albums are displayed in a responsive grid of thumbnail cards (4 columns on medium+ screens, 2 columns on small screens). Each card shows title, artist, release year, and genre.
2. **Switch to list view** — Click the list icon (glyphicon-th-list) in the "view as" controls. Albums are displayed in a striped table with columns: Album Title, Artist, Year, Genre, and an actions column.
3. **Switch back to grid view** — While in list view, click the grid icon (glyphicon-th). The display returns to the thumbnail card layout.
4. **Both views show all albums** — In either view, all albums from the database are visible. The count of displayed albums matches the count returned by `GET /albums`.
5. **Both views support actions** — In both grid and list view, each album has a gear icon dropdown with "edit" and "delete" options that function identically.
