## Wholphin Companion - Client Integration Notes

This plugin exposes a lightweight "recipe" that Wholphin should use to render the Home UI. The response does **not** include media items; it only describes which endpoints the client should call to fetch data.

## Endpoint

`GET /Wholphin/Config`

Optional query:
- `userId=<JellyfinUserId>`: Force a specific user profile. If not provided, the plugin resolves the user from the request context.

Auth:
- Standard Jellyfin auth headers (e.g. `X-Emby-Token`) or an authenticated session cookie.

## Response Shape

The response is a JSON object with a `Layout` array. Each item is a section with a list of rows.

Example:
```
{
  "layout": [
    {
      "type": "section",
      "title": "Pinned",
      "rows": [
        {
          "type": "system",
          "label": "Continue Watching",
          "endpointParams": {
            "NativeRow": "ContinueWatching"
          }
        }
      ]
    }
  ]
}
```

## Sections

Each `layout` entry:
- `type`: always `"section"`
- `title`: section title from admin config
- `rows`: array of row objects

If the admin enabled shuffle for a section, the server shuffles the row order **before** returning the response.

## Rows

Each row has:
- `type`: `"system"` or `"collection"` (lowercase)
- `label`: display label (server sets for native rows if blank)
- `pluginId`: only set for collection rows
- `endpointParams`: key/value bag for row metadata

### Native row

`type: "system"` with `endpointParams.NativeRow` set to one of:
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

Wholphin should translate these keys into the actual Jellyfin endpoints it already uses for the home screen (e.g. `/Users/{UserId}/Items/Resume`, `/Users/{UserId}/NextUp`, etc.).

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

## Fallback Behavior

If there is no user-specific profile, the plugin returns the `Global` profile.

## Known behavior notes

- The server does not enforce any ordering besides the admin-configured order (and optional shuffle).
- The server does not include any media items; the client must fetch items from Jellyfin as needed.