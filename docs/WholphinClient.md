## Wholphin Companion - Client Integration Notes

This plugin exposes a lightweight "recipe" that Wholphin should use to render the Home UI and per-library screens (Movies, Shows). The response does **not** include media items; it only describes which endpoints the client should call to fetch data.

## Endpoint

`GET /Wholphin/Config`

Optional query:
- `userId=<JellyfinUserId>`: Force a specific user profile. If not provided, the plugin resolves the user from the request context.

Auth:
- Standard Jellyfin auth headers (e.g. `X-Emby-Token`) or an authenticated session cookie.

## Response Shape

The response is a JSON object with:

- **`Layout`** – array of sections for the **home** screen. Each item is a section with a list of rows.
- **`LibraryLayouts`** – object keyed by Jellyfin **view (library) Id**. Each value is an array of sections in the same format as `Layout`. Use this when the user is viewing a library (e.g. Movies or Shows) to render that library’s configured rows. If a view Id is missing or the array is empty, the client should fall back to a default layout.

Example:
```
{
  "Layout": [
    {
      "Type": "section",
      "Title": "Pinned",
      "Rows": [
        {
          "Type": "system",
          "Label": "Continue Watching",
          "HideWatchedItems": false,
          "EndpointParams": {
            "NativeRow": "ContinueWatching"
          }
        }
      ]
    }
  ],
  "LibraryLayouts": {
    "viewId-for-movies-library": [
      {
        "Type": "section",
        "Title": "Discover",
        "Rows": [
          {
            "Type": "system",
            "Label": "Continue Watching",
            "HideWatchedItems": false,
            "EndpointParams": { "NativeRow": "ContinueWatching" }
          }
        ]
      }
    ]
  }
}
```

Note: property names may be PascalCase or camelCase depending on the serializer; the client should handle both (e.g. `Layout`/`layout`, `LibraryLayouts`/`libraryLayouts`, `Type`/`type`, `Title`/`title`, `Rows`/`rows`, `Label`/`label`, `EndpointParams`/`endpointParams`, `HideWatchedItems`/`hideWatchedItems`).

## Sections

Each section (in `Layout` or in any `LibraryLayouts` entry):
- `type` / `Type`: always `"section"`
- `title` / `Title`: section title from admin config
- `rows` / `Rows`: array of row objects

If the admin enabled shuffle for a section, the server shuffles the row order **before** returning the response.

## Rows

Each row has:
- `type` / `Type`: `"system"` or `"collection"` (lowercase)
- `label` / `Label`: display label (server sets for native rows if blank)
- `pluginId` / `PluginId`: only set for collection rows
- `hideWatchedItems` / `HideWatchedItems`: whether to exclude watched items when fetching
- `endpointParams` / `EndpointParams`: key/value bag for row metadata

### Native row

`type: "system"` with `endpointParams.NativeRow` set to one of the supported keys below.

**Home layout** may use:
- `ContinueWatching`
- `NextUp`
- `ContinueWatchingCombined`
- `RecentlyAddedMovies`
- `RecentlyAddedShows`
- `RecentlyReleased`
- `LatestMovies`
- `LatestShows`
- `BecauseYouWatched`
- `WatchItAgain`

**Library layouts** (Movies / Shows) may also use:
- `RecentlyAddedEpisodes` – recently added episodes (Shows)
- `LatestEpisodes` – latest episodes (Shows)
- `Suggestions` – suggestions
- `TopRatedUnwatched` – top rated unwatched

Wholphin should translate these keys into the actual Jellyfin endpoints (e.g. `/Users/{UserId}/Items/Resume`, `/Users/{UserId}/NextUp`, etc.). For library screens, use the layout from `LibraryLayouts[viewId]` where `viewId` is the current library’s view Id; if missing or empty, use a default layout.

#### Because You Watched detail

For `NativeRow: "BecauseYouWatched"`, the server also returns `endpointParams.ItemId` containing a seed item id. Wholphin should use that seed id to fetch "Because You Watched" items for the row.

### Collection row

`type: "collection"` with:
- `pluginId`: a Jellyfin collection (BoxSet) item id

Wholphin should call the collection endpoint(s) it uses to render a collection row using this id.

Example collection row:
```
{
  "type": "collection",
  "label": "Sci-Fi",
  "pluginId": "1234567890abcdef1234567890abcdef",
  "endpointParams": {}
}
```

Example section with a mix of native + collection rows:
```
{
  "type": "section",
  "title": "Discovery",
  "rows": [
    {
      "type": "system",
      "label": "Trending",
      "endpointParams": {
        "NativeRow": "RecentlyReleased"
      }
    },
    {
      "type": "collection",
      "label": "Sci-Fi",
      "pluginId": "1234567890abcdef1234567890abcdef",
      "endpointParams": {}
    }
  ]
}
```

## Library layouts

- **`LibraryLayouts`** is keyed by the Jellyfin view (library) Id. Only libraries that have a configured layout in the plugin appear; Collections (BoxSets) libraries are not configurable and will not appear.
- When displaying a library screen (e.g. Movies or Shows), look up the current view Id in `LibraryLayouts`. If present and non-empty, render that array of sections the same way as home. If absent or empty, the client should fall back to a default (e.g. a single “All items” row or a standard set of rows).
- Section and row structure is identical to home (visibility dates, shuffle, native rows, collection rows). The set of allowed `NativeRow` values is constrained per library type in the admin UI; see `docs/LIBRARY_LAYOUTS_IMPLEMENTATION.md` for the full list by type.

## Fallback Behavior

If there is no user-specific profile, the plugin returns the `Global` profile.

## Known behavior notes

- The server does not enforce any ordering besides the admin-configured order (and optional shuffle).
- The server does not include any media items; the client must fetch items from Jellyfin as needed.