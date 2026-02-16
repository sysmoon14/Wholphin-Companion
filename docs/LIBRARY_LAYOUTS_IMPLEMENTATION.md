# Library Layouts – Implementation Guide for Wholphin

This document describes the **library layout** feature added to the Wholphin Companion plugin so you can implement the corresponding behavior in the Wholphin client (e.g. with Cursor).

---

## 1. What the Plugin Does (Server Side)

### 1.1 Admin configuration

- In the plugin configuration page (Jellyfin dashboard → Plugins → Wholphin Companion), there are now:
  - **Home Rows** – existing; configures the home screen sections/rows.
  - **{LibraryName} Rows** – one tab per **Movies** and **Shows** library (e.g. "Movies Rows", "Shows Rows"). Same layout as Home Rows: sections with titles, shuffle/visibility options, and rows.
  - **Client Settings** – unchanged.

- **Collections (BoxSets) libraries** are intentionally excluded: no "Collections Rows" tab is created and no library layout is stored for them.

- Layout is stored **per profile** (Global or per user), same as Home Layout. Each profile has:
  - `HomeLayout.Sections` – home screen (unchanged).
  - `LibraryLayout.LibrarySections` – a map from **Jellyfin view (library) Id** → layout for that library. Each value has the same shape as home: `{ "Sections": [ ... ] }`.

### 1.2 Data shape of a library layout

For a given library (view) Id, the stored layout is the same structure as the home layout:

- **Sections** – array of section objects.
- Each **section** has:
  - `Title` (string)
  - `ShuffleRows` (bool), `ShuffleRowCount` (int?), `VisibleFrom`, `VisibleTo` (date strings)
  - `HomeRows` – array of row objects.
- Each **row** has:
  - `RowType`: `"System"` (native row) or `"Collection"`
  - `Label`, `NativeRowKey` (for system rows), `PluginId` (for collection rows – BoxSet id)
  - `HideWatchedItems` (bool)
  - `EndpointParams` (e.g. `NativeRow`, and for BecauseYouWatched, `ItemId`)

So the client can treat **library layout** exactly like **home layout**: sections with rows; only the set of allowed `NativeRow` keys differs by library type (see below).

---

## 2. Native Row Keys by Library Type

The plugin restricts which native rows can be configured per library type.

### 2.1 Movies libraries (`CollectionType === "movies"`)

Allowed **NativeRow** values:

| Key | Label |
|-----|--------|
| `ContinueWatching` | Continue Watching |
| `RecentlyAddedMovies` | Recently Added Movies |
| `LatestMovies` | Latest Movies |
| `BecauseYouWatched` | Because You Watched |
| `WatchItAgain` | Watch it Again |
| `Suggestions` | Suggestions |
| `TopRatedUnwatched` | Top Rated Unwatched |

**Collection** rows: same as home – `type: "collection"` with `pluginId` = Jellyfin BoxSet (collection) item id. All collections are listed; no server-side filtering by library type in the config UI.

### 2.2 Shows libraries (`CollectionType === "tvshows"`)

Allowed **NativeRow** values:

| Key | Label |
|-----|--------|
| `NextUp` | Up Next |
| `ContinueWatching` | Continue Watching |
| `ContinueWatchingCombined` | Continue Watching (Combined) |
| `RecentlyAddedShows` | Recently Added Shows |
| `LatestShows` | Latest Shows |
| `RecentlyAddedEpisodes` | Recently Added Episodes |
| `LatestEpisodes` | Latest Episodes |
| `BecauseYouWatched` | Because You Watched |
| `WatchItAgain` | Watch it Again |
| `Suggestions` | Suggestions |
| `TopRatedUnwatched` | Top Rated Unwatched |

**Collection** rows: same as home (all collections).

### 2.3 Home (existing)

Home continues to use the existing set (e.g. Continue Watching, Next Up, Continue Watching (Combined), Recently Added Movies/Shows, Latest Movies/Shows, Because You Watched, Watch It Again). The new keys `Suggestions`, `TopRatedUnwatched`, `RecentlyAddedEpisodes`, and `LatestEpisodes` are only guaranteed to appear in **library** layouts; you can add support for them on home later if desired.

---

## 3. API Response (Implemented)

**GET /Wholphin/Config** returns both home and library layouts:

- **`Layout`** – home layout (array of sections, same as before).
- **`LibraryLayouts`** – object keyed by Jellyfin view (library) Id. Each value is an array of sections in the same format as `Layout`.

See **WholphinClient.md** for the full response shape, property names (PascalCase/camelCase), and auth.

---

## 4. Client-Side Implementation Checklist (Wholphin)

Use this when implementing in the Wholphin app (e.g. with Cursor).

1. **Resolve layout by context**
   - **Home screen** → use `Layout` from `GET /Wholphin/Config`.
   - **Library screen (Movies or Shows)** → use `LibraryLayouts[viewId]` where `viewId` is the current library’s Jellyfin view Id.

2. **Reuse home layout handling**
   - Treat library layout as the same structure as home: array of sections, each with `type`, `title`, `rows`. Same row `type` (`system` vs `collection`), `label`, `pluginId`, `hideWatchedItems`, `endpointParams`.
   - Reuse the same section/row UI and the same logic that maps `endpointParams.NativeRow` (and optional `ItemId` for BecauseYouWatched) to Jellyfin API calls.

3. **Support the new native row keys**
   - **Movies:** `Suggestions`, `TopRatedUnwatched` (plus existing ones already used on home where applicable).
   - **Shows:** `RecentlyAddedEpisodes`, `LatestEpisodes`, `Suggestions`, `TopRatedUnwatched` (plus existing ones).
   - Map these to the appropriate Jellyfin endpoints (e.g. suggestions, top rated unwatched, recently added episodes, latest episodes) in the same way you already map `ContinueWatching`, `NextUp`, etc.

4. **Identify the current library**
   - When the user opens a library (e.g. Movies or Shows), use the **view Id** from Jellyfin (e.g. from `Users/.../Views` or the current route) to look up `LibraryLayouts[viewId]`.

5. **Fallback when no library layout exists**
   - If there is no layout for a given view Id (empty or missing), fall back to a default set of sections/rows or a single “all items” row, so the screen still works before any library layout is configured.

---

## 5. Summary

| Item | Detail |
|------|--------|
| **Config UI** | One "LibraryName Rows" tab per Movies/Shows library; same section/row editor as Home Rows. Collections libraries excluded. |
| **Storage** | Per profile: `LibraryLayout.LibrarySections[viewId]` = same shape as home layout. |
| **Config API** | **GET /Wholphin/Config** returns `Layout` (home) and `LibraryLayouts` (keyed by view Id). See WholphinClient.md. |
| **Client** | Use `Layout` for home; use `LibraryLayouts[viewId]` for library screens; support new native row keys; fallback when no layout is configured. |
