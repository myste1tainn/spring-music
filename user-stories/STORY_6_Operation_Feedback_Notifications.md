# Story 6: Operation Feedback Notifications

**As an** end user,
**I want** to see clear success or error messages after performing actions,
**so that** I know whether my changes were saved or something went wrong.

## Acceptance Criteria

### Frontend UI

1. **Success on album save** — Add or edit an album successfully. A green alert banner appears with the message "Album saved".
2. **Success on album delete** — Delete an album. A green alert banner appears with the message "Album deleted".
3. **Error on save failure** — If the backend is unreachable or returns an error during save, a red alert banner appears with "Error saving album: " followed by the HTTP status code.
4. **Error on delete failure** — If the backend returns an error during delete, a red alert banner appears with "Error deleting album: " followed by the HTTP status code.
5. **Dismissible alerts** — Click the X (close) button on an alert banner. The banner disappears immediately.
6. **Alert styling** — Success messages use Bootstrap's `alert-success` class (green). Error messages use `alert-danger` class (red).
