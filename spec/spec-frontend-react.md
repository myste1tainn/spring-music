# Frontend Technical Specification — React Application

| Field | Value |
|---|---|
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Date** | 2026-03-20 |
| **Stack** | React 18, TypeScript, Vite, TanStack Query, Zustand, React Hook Form |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Project Structure](#2-project-structure)
3. [TypeScript Types](#3-typescript-types)
4. [API Client Contract](#4-api-client-contract)
5. [Component Specifications](#5-component-specifications)
6. [State Management](#6-state-management)
7. [Routing](#7-routing)
8. [Form Validation Rules](#8-form-validation-rules)
9. [UI State Contract](#9-ui-state-contract)
10. [Custom Hooks](#10-custom-hooks)
11. [Testing Strategy](#11-testing-strategy)
12. [Dependencies](#12-dependencies)

---

## 1. Overview

This application is a React rewrite of the AngularJS SPA bundled with the Spring Music monolith. It communicates exclusively with the Go backend API over REST. It preserves all existing user-facing features: album grid/list views, inline field editing, add/edit/delete modals, app info panel, and chaos testing controls.

**Development server:** `http://localhost:5173`
**API base URL (dev):** `http://localhost:8080` (proxied via Vite)

---

## 2. Project Structure

```
spring-music-ui/
├── src/
│   ├── api/
│   │   ├── client.ts           # Base fetch wrapper, error normalisation
│   │   ├── albums.ts           # Album API functions
│   │   ├── info.ts             # AppInfo + service binding API functions
│   │   └── chaos.ts            # Chaos endpoint functions
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx    # Page chrome: header + footer
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── albums/
│   │   │   ├── AlbumGrid.tsx
│   │   │   ├── AlbumList.tsx
│   │   │   ├── AlbumCard.tsx   # Used in grid view
│   │   │   ├── AlbumRow.tsx    # Used in list view
│   │   │   ├── AlbumModal.tsx  # Add / Edit modal
│   │   │   ├── AlbumForm.tsx   # Form inside modal
│   │   │   └── InPlaceEdit.tsx # Inline field editor
│   │   ├── info/
│   │   │   └── InfoPanel.tsx
│   │   ├── chaos/
│   │   │   └── ChaosPanel.tsx
│   │   └── shared/
│   │       ├── StatusBanner.tsx
│   │       ├── Spinner.tsx
│   │       └── EmptyState.tsx
│   ├── hooks/
│   │   ├── useAlbums.ts
│   │   ├── useAlbumMutations.ts
│   │   ├── useAppInfo.ts
│   │   └── useStatusBanner.ts
│   ├── store/
│   │   └── uiStore.ts          # Zustand store for UI-only state
│   ├── types/
│   │   └── index.ts            # All shared TypeScript types
│   ├── utils/
│   │   └── uuid.ts             # generateUUID helper
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. TypeScript Types

All shared types live in `src/types/index.ts`.

```ts
// Domain

export interface Album {
  id: string;
  title: string;
  artist: string;
  releaseYear: string;
  genre: string;
  trackCount: number;
  albumId: string;
}

export type CreateAlbumInput = Omit<Album, 'id'>;

export type UpdateAlbumInput = Album; // id is required for update

// Info

export interface AppInfo {
  profiles: string[];
  services: string[];
}

export interface ServiceBinding {
  name: string;
  label: string;
  tags: string[];
  credentials: Record<string, string>;
}

// API error

export interface ApiError {
  error: string;   // machine code e.g. "ALBUM_NOT_FOUND"
  message: string; // human-readable
  code: number;    // HTTP status
}

// Sort/view UI state

export type AlbumViewMode = 'grid' | 'list';

export type AlbumSortField = 'title' | 'artist' | 'releaseYear' | 'genre';

export interface SortState {
  field: AlbumSortField;
  descending: boolean;
}

// Status banner

export type BannerVariant = 'success' | 'error' | 'info';

export interface BannerMessage {
  id: string;
  variant: BannerVariant;
  text: string;
}
```

---

## 4. API Client Contract

### 4.1 Base Client

```ts
// src/api/client.ts

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(path: string, options?: RequestOptions): Promise<T>
```

**Behaviour:**
- Prepend `BASE_URL` to all paths
- On non-2xx response, parse body as `ApiError` and throw it
- Sets `Content-Type: application/json` on POST/PUT automatically

### 4.2 Albums API

```ts
// src/api/albums.ts

export const albumsApi = {
  list():                      Promise<Album[]>
  getById(id: string):         Promise<Album>
  create(input: CreateAlbumInput): Promise<Album>   // PUT /albums
  update(input: UpdateAlbumInput): Promise<Album>   // POST /albums
  delete(id: string):          Promise<void>        // DELETE /albums/{id}
}
```

### 4.3 Info API

```ts
// src/api/info.ts

export const infoApi = {
  getAppInfo():       Promise<AppInfo>
  getServiceBindings(): Promise<ServiceBinding[]>
}
```

### 4.4 Chaos API

```ts
// src/api/chaos.ts

export const chaosApi = {
  kill():        Promise<void>
  throwError():  Promise<void>
}
```

### 4.5 Vite Proxy (Development)

```ts
// vite.config.ts

server: {
  proxy: {
    '/albums':   'http://localhost:8080',
    '/appinfo':  'http://localhost:8080',
    '/service':  'http://localhost:8080',
    '/errors':   'http://localhost:8080',
    '/actuator': 'http://localhost:8080',
  }
}
```

---

## 5. Component Specifications

### 5.1 `<AppShell />`

Wraps all pages. Renders `<Header />` and `<Footer />`. Provides the `<StatusBanner />` slot.

**Props:** none
**Children:** page content

---

### 5.2 `<Header />`

Displays app name and navigation tabs: Albums | Info | Chaos.

**Props:** none
**State consumed:** active tab from `uiStore`

---

### 5.3 `<AlbumGrid />`

Renders albums as a responsive card grid. Each card is `<AlbumCard />`.

**Props:**
```ts
interface AlbumGridProps {
  albums: Album[];
  onEdit:   (album: Album) => void;
  onDelete: (album: Album) => void;
}
```

---

### 5.4 `<AlbumList />`

Renders albums as a sortable table. Each row is `<AlbumRow />` with inline editing via `<InPlaceEdit />`.

**Props:**
```ts
interface AlbumListProps {
  albums:   Album[];
  sort:     SortState;
  onSort:   (field: AlbumSortField) => void;
  onEdit:   (album: Album) => void;
  onDelete: (album: Album) => void;
}
```

---

### 5.5 `<AlbumCard />`

Single album in grid view. Displays: title, artist, year, genre, track count. Edit and delete action buttons.

**Props:**
```ts
interface AlbumCardProps {
  album:    Album;
  onEdit:   (album: Album) => void;
  onDelete: (album: Album) => void;
}
```

---

### 5.6 `<AlbumRow />`

Single album in list/table view. Each field cell wraps content in `<InPlaceEdit />`.

**Props:**
```ts
interface AlbumRowProps {
  album:    Album;
  onSave:   (updated: Album) => void;
  onDelete: (album: Album) => void;
}
```

---

### 5.7 `<AlbumModal />`

Modal dialog for add and edit operations. Contains `<AlbumForm />`.

**Props:**
```ts
interface AlbumModalProps {
  mode:     'add' | 'edit';
  album?:   Album;           // required when mode='edit'
  open:     boolean;
  onClose:  () => void;
  onSubmit: (data: CreateAlbumInput | UpdateAlbumInput) => void;
}
```

**Behaviour:**
- Displays "Add an album" or "Edit an album" title based on `mode`
- OK button disabled while form is invalid
- Calls `onSubmit` with form data; does not close itself — caller closes on mutation success
- Cancel dismisses without saving

---

### 5.8 `<AlbumForm />`

Controlled form rendered inside `<AlbumModal />`. Uses React Hook Form.

**Props:**
```ts
interface AlbumFormProps {
  defaultValues?: Partial<Album>;
  onSubmit: (data: CreateAlbumInput) => void;
  formId:   string; // ties the external OK button via form= attribute
}
```

**Fields rendered:** title, artist, releaseYear, genre. `trackCount` and `albumId` are optional and collapsed behind an "Advanced" toggle.

---

### 5.9 `<InPlaceEdit />`

Renders a field value as plain text; clicking it swaps to an input. On Enter or blur with a valid value, calls `onSave`. On Escape, reverts.

**Props:**
```ts
interface InPlaceEditProps {
  value:     string | number;
  fieldName: string;
  inputType: 'text' | 'number';
  pattern?:  RegExp;
  onSave:    (newValue: string) => void;
}
```

**State:** `editing: boolean`, `draft: string` — local only, not lifted.

---

### 5.10 `<InfoPanel />`

Displays `AppInfo` (active profiles, bound service names) and the full service binding list.

**Props:** none
**Data:** fetched via `useAppInfo()` hook

---

### 5.11 `<ChaosPanel />`

Two buttons: "Kill Application" and "Throw Exception". Each shows a confirmation step before calling the API.

**Props:** none

---

### 5.12 `<StatusBanner />`

Displays a dismissable success/error message at the top of the page. Auto-dismisses after 4 seconds.

**Props:**
```ts
interface StatusBannerProps {
  messages: BannerMessage[];
  onDismiss: (id: string) => void;
}
```

---

### 5.13 `<EmptyState />`

Shown in album views when `albums.length === 0`.

**Props:**
```ts
interface EmptyStateProps {
  onAdd: () => void;
}
```

---

## 6. State Management

### 6.1 Server State — TanStack Query

All server data is managed by TanStack Query. No album data is stored in Zustand.

| Query Key | Source | Stale Time |
|---|---|---|
| `['albums']` | `GET /albums` | 30s |
| `['albums', id]` | `GET /albums/{id}` | 60s |
| `['appinfo']` | `GET /appinfo` | 60s |
| `['services']` | `GET /service` | 60s |

Mutations (`createAlbum`, `updateAlbum`, `deleteAlbum`) all call `queryClient.invalidateQueries({ queryKey: ['albums'] })` on success.

### 6.2 UI State — Zustand

```ts
// src/store/uiStore.ts

interface UIStore {
  activeTab:   'albums' | 'info' | 'chaos';
  viewMode:    AlbumViewMode;       // 'grid' | 'list'
  sort:        SortState;
  banners:     BannerMessage[];
  modalState:  { open: boolean; mode: 'add' | 'edit'; album?: Album };

  setTab:      (tab: UIStore['activeTab']) => void;
  setViewMode: (mode: AlbumViewMode) => void;
  setSort:     (field: AlbumSortField) => void;
  pushBanner:  (variant: BannerVariant, text: string) => void;
  dismissBanner: (id: string) => void;
  openAddModal:  () => void;
  openEditModal: (album: Album) => void;
  closeModal:    () => void;
}
```

---

## 7. Routing

The app uses `react-router-dom` with hash routing (no server config required).

```
/           → redirect to /albums
/albums     → AlbumGrid or AlbumList (toggled by viewMode)
/info       → InfoPanel
/chaos      → ChaosPanel
```

```ts
// src/App.tsx

<Routes>
  <Route path="/" element={<Navigate to="/albums" replace />} />
  <Route path="/albums" element={<AlbumsPage />} />
  <Route path="/info"   element={<InfoPage />} />
  <Route path="/chaos"  element={<ChaosPage />} />
</Routes>
```

---

## 8. Form Validation Rules

Validation is applied client-side via React Hook Form + Zod schema, and server-side by the Go API. Both layers must enforce the same rules.

```ts
// Zod schema — source of truth for form validation

const albumSchema = z.object({
  title:       z.string().min(1, 'Title is required'),
  artist:      z.string().min(1, 'Artist is required'),
  releaseYear: z.string()
                .regex(/^[1-2]\d{3}$/, 'Must be a 4-digit year (1000–2999)'),
  genre:       z.string().min(1, 'Genre is required'),
  trackCount:  z.number().int().min(0).optional().default(0),
  albumId:     z.string().optional().default(''),
});
```

**Field-level feedback:** Each field shows a validation message below the input as soon as it has been touched and is invalid. The submit button is disabled while the form is invalid.

---

## 9. UI State Contract

Each data-dependent component must handle all four states:

| State | Trigger | Rendered by |
|---|---|---|
| **Loading** | query `isLoading === true` | `<Spinner />` |
| **Error** | query `isError === true` | inline error message with retry button |
| **Empty** | `data.length === 0` | `<EmptyState />` |
| **Success** | `data.length > 0` | `<AlbumGrid />` or `<AlbumList />` |

Mutation states:
- While a mutation is pending, the triggering button shows a spinner and is disabled
- On success, `pushBanner('success', message)` is called
- On error, `pushBanner('error', apiError.message)` is called

---

## 10. Custom Hooks

### `useAlbums()`

```ts
// src/hooks/useAlbums.ts

function useAlbums(): {
  albums:    Album[];
  isLoading: boolean;
  isError:   boolean;
  error:     ApiError | null;
}
```

Wraps `useQuery({ queryKey: ['albums'], queryFn: albumsApi.list })`.
Returns sorted albums according to `uiStore.sort` (sort is applied in the hook, not the component).

---

### `useAlbumMutations()`

```ts
// src/hooks/useAlbumMutations.ts

function useAlbumMutations(): {
  createAlbum: UseMutationResult<Album, ApiError, CreateAlbumInput>
  updateAlbum: UseMutationResult<Album, ApiError, UpdateAlbumInput>
  deleteAlbum: UseMutationResult<void, ApiError, string>
}
```

All three mutations:
1. Invalidate `['albums']` on success
2. Call `pushBanner` with success or error message
3. Close modal on create/update success

---

### `useAppInfo()`

```ts
function useAppInfo(): {
  appInfo:   AppInfo | undefined;
  services:  ServiceBinding[];
  isLoading: boolean;
}
```

---

### `useStatusBanner()`

```ts
function useStatusBanner(): {
  banners:  BannerMessage[];
  push:     (variant: BannerVariant, text: string) => void;
  dismiss:  (id: string) => void;
}
```

Auto-dismiss timer: each banner schedules a `setTimeout(() => dismiss(id), 4000)` on mount.

---

## 11. Testing Strategy

### Unit Tests (Vitest + React Testing Library)

Every component must have a co-located `*.test.tsx` file.

| Target | What to assert |
|---|---|
| `<AlbumForm />` | Validation messages appear; submit fires with correct data |
| `<InPlaceEdit />` | Renders value; clicking enables input; Enter calls onSave; Escape reverts |
| `<AlbumCard />` | Renders all album fields; edit/delete buttons fire callbacks |
| `<StatusBanner />` | Shows message; dismiss removes it; auto-dismiss fires after 4s |
| API client | Mock `fetch`; assert correct URL, method, headers, error parsing |

### Hook Tests

Use `renderHook` from `@testing-library/react` with a `QueryClient` wrapper.

| Hook | What to assert |
|---|---|
| `useAlbums` | Returns sorted albums; loading/error states |
| `useAlbumMutations` | create/update/delete call correct API functions; banner is pushed on success and error |

### Integration / E2E Tests (Playwright)

| Scenario | Steps |
|---|---|
| Add album | Open modal → fill form → submit → album appears in list |
| Edit album | Click edit → change title → submit → updated title shown |
| Delete album | Click delete → confirm → album removed from list |
| Inline edit | Click field in list view → type new value → press Enter → value saved |
| Empty state | Mock API returning `[]` → `<EmptyState />` renders |
| Error state | Mock API returning 500 → error message rendered |

### Run All Tests

```bash
npm test              # Vitest unit + hook tests
npm run test:e2e      # Playwright
npm run test:coverage # Coverage report
```

---

## 12. Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "@tanstack/react-query": "^5.56.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@testing-library/jest-dom": "^6.5.0",
    "msw": "^2.4.0",
    "@playwright/test": "^1.47.0"
  }
}
```

### Styling

No UI framework is prescribed. Options in preference order:
1. **Tailwind CSS** — utility-first, no runtime overhead
2. **CSS Modules** — zero dependency, co-located styles
3. **shadcn/ui** — if a component library is needed

The specification is style-agnostic; visual design follows separately.
