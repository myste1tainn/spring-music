# Story 4: Inline Album Editing

**As an** end user,
**I want** to click on an album field and edit it directly without opening a separate form,
**so that** I can make quick changes efficiently.

## Acceptance Criteria

### Frontend UI

1. **Activate inline editor** — In either grid or list view, click on an album's title text. The text is replaced by a text input field pre-filled with the current value, plus a checkmark (confirm) and X (cancel) button.
2. **Save with checkmark button** — Change the value in the inline editor and click the checkmark button. The field updates to the new value and an "Album saved" banner appears.
3. **Save with Enter key** — Change the value in the inline editor and press the Enter key. The edit is saved, identical to clicking the checkmark.
4. **Cancel with X button** — Activate the inline editor, then click the X button. The editor closes and the original value is restored without saving.
5. **Cancel with Escape key** — Activate the inline editor, then press the Escape key. The editor closes without saving.
6. **All fields are editable inline** — Title, artist, release year, and genre can each be edited inline in both grid and list views.
7. **Empty value rejected** — Activate the inline editor, clear the input to an empty string, and click the checkmark. The save does not proceed (empty values are blocked).

### Backend API

8. **Inline edits persist via API** — After an inline edit, send `GET /albums/{id}` for the edited album. The response reflects the updated field value, confirming the change was persisted to the backend.
