# Wholphin App – Companion Plugin Integration

This document describes how the Wholphin app (Android TV / client) should integrate with the **Wholphin Companion** Jellyfin plugin. Pass this to the agent or developer building the app-side functionality.

---

## 1. Base URL and auth

- **Base URL:** The Jellyfin server base URL (e.g. `https://jellyfin.example.com`). No path prefix; the plugin is mounted under the server.
- **Auth:** Use the same authentication the app already uses for Jellyfin:
  - **Header:** `X-Emby-Token: <api_key>` or `X-Emby-Authorization: MediaBrowser ...` (with token), and
  - **User context:** `X-Emby-User-Id: <userId>` when the request is for a specific user (or the plugin may resolve the user from the auth token).
- **Endpoints:** All plugin endpoints are under the `Wholphin` route, e.g. `GET {baseUrl}/Wholphin/Config`, `GET {baseUrl}/Wholphin/Settings`.

---

## 2. Endpoints overview

| Endpoint | Purpose |
|----------|---------|
| `GET /Wholphin/Config` | Home screen layout (sections and rows). Already implemented. |
| `GET /Wholphin/Settings` | Merged settings for the current (or specified) user: global settings, user settings, Seerr credentials, nav drawer pins. **Implement on the plugin if not present; consume on the app.** |

---

## 3. GET /Wholphin/Config (home layout)

**Request**

- **Method:** GET  
- **Path:** `/Wholphin/Config`  
- **Query (optional):** `userId=<JellyfinUserId>` to force a user. If omitted, the plugin resolves the user from the request (e.g. `X-Emby-User-Id` or auth).

**Response (JSON)**

- **Property names:** camelCase (e.g. `layout`, `type`, `title`, `rows`, `endpointParams`, `pluginId`).

```json
{
  "layout": [
    {
      "type": "section",
      "title": "Section title from admin",
      "rows": [
        {
          "type": "system",
          "label": "Continue Watching",
          "pluginId": null,
          "hideWatchedItems": false,
          "endpointParams": {
            "NativeRow": "ContinueWatching"
          }
        },
        {
          "type": "collection",
          "label": "Collection display name",
          "pluginId": "<BoxSet-item-id>",
          "hideWatchedItems": false,
          "endpointParams": {}
        }
      ]
    }
  ]
}
```

**Row types**

- **`hideWatchedItems`** (boolean, optional) – When `true`, the app should exclude items the user has already watched when fetching this row’s data (e.g. add `IsPlayed=false` or equivalent to the Jellyfin API query). Omitted or `false` means no filter.
- **`type: "system"`** – Native row. Use `endpointParams.NativeRow` to decide which Jellyfin data to load. Supported values: `ContinueWatching`, `NextUp`, `ContinueWatchingCombined`, `RecentlyAddedMovies`, `RecentlyAddedShows`, `LatestMovies`, `LatestShows`, `BecauseYouWatched`, `WatchItAgain`. For `BecauseYouWatched`, `endpointParams.ItemId` is the seed item id for the row.
- **`type: "collection"`** – Collection row. Use `pluginId` as the Jellyfin BoxSet (collection) item id and call your usual collection endpoint(s).

**Behavior**

- If there is no user-specific layout, the plugin returns the **Global** layout.
- Section order and optional shuffle are applied by the plugin; the app renders sections and rows in the order given.

---

## 4. GET /Wholphin/Settings (effective settings for the user)

**Purpose:** One call that returns the effective settings. **No duplicate data:** `global` contains only the keys from the "Global (device-only)" section (sign_in_auto, update_url, max_bitrate). `user` contains everything else (all user-level settings) with inheritance applied: when "Use global settings" is checked for the whole user or "Use global setting" for an individual key, the user object contains the global value for that key.

**Request**

- **Method:** GET  
- **Path:** `/Wholphin/Settings`  
- **Query (optional):** `userId=<JellyfinUserId>`. If omitted, user is resolved from request context.

**Response (JSON) – contract for the app**

All values that are stored as strings in the plugin are returned as strings here unless noted. Missing keys mean “use app default”.

```json
{
  "global": {
    "sign_in_auto": "true",
    "update_url": "https://api.github.com/repos/sysmoon14/Wholphin/releases/latest",
    "max_bitrate": "17"
  },
  "user": {
    "max_homepage_items": "25",
    "hide_settings_cog": "false",
    "allow_settings_override": "true",
    "rewatch_next_up": "false",
    "backdrop_display": "0",
    "play_theme_music": "3",
    "remember_selected_tab": "true",
    "app_theme": "0",
    "show_clock": "true",
    "combined_search_results": "false",
    "nav_drawer_switch_on_focus": "true",
    "skip_forward_preference": "30",
    "skip_back_preference": "10",
    "skip_back_on_resume_preference": "0",
    "hide_controller_timeout": "5000",
    "seek_bar_steps": "16",
    "playback_debug_info": "false",
    "global_content_scale": "0",
    "one_click_pause": "false",
    "auto_play_next": "true",
    "auto_play_next_delay": "15",
    "show_next_up_when": "0",
    "pass_out_protection": "2",
    "skip_intro_behavior": "1",
    "skip_outro_behavior": "1",
    "skip_commercials_behavior": "1",
    "skip_previews_behavior": "0",
    "skip_recap_behavior": "0",
    "show_details": "true",
    "favorite_channels_at_beginning": "true",
    "sort_channels_recently_watched": "false",
    "color_code_programs": "true",
    "seerr_credentials": {
      "url": "https://seerr.example.com",
      "authMethod": "API_KEY",
      "username": "",
      "passwordOrApiKey": "<api-key-string>"
    },
    "nav_drawer_items": {
      "items": [
        { "itemId": "a_favorites", "type": "PINNED" },
        { "itemId": "a_discover", "type": "PINNED" },
        { "itemId": "s_<view-uuid>", "type": "UNPINNED" }
      ]
    }
  }
}
```

**Notes**

- **`global`** – Only the "Global (device-only)" keys: sign_in_auto, update_url, max_bitrate. Nothing else.
- **`user`** – All other settings (user-level only). Inheritance is applied: if "Use global settings" or "Use global setting" per key is set, the value in `user` is the global value for that key. Omitted keys: use app default.
- **`user.seerr_credentials`** – Present only if the user has configured Seerr in the plugin. It is a **parsed object** (not a string). Use it to connect to Seerr (base URL, auth method, username, password/API key). `authMethod`: `"API_KEY"` | `"JELLYFIN"` | `"LOCAL"`.
- **`nav_drawer_items`** – Present only if the user has customized the nav bar. It is a **parsed object** with a single key **`items`**: array of `{ "itemId": string, "type": "PINNED" | "UNPINNED" }`. Order of the array is the nav bar order. PINNED = show in the nav bar; UNPINNED = under “More” or hidden. Home and Search are not in this list; do not offer them as pin options. `itemId` values:
  - Built-in: `a_favorites` (Favorites), `a_discover` (Discover; only when Seerr is enabled/linked).
  - Libraries: `s_<uuid>` where `<uuid>` is the Jellyfin view id (from user views). Do not assume fixed ids for “Movies” or “Shows”; use the ids returned by the plugin / server.

---

## 5. Setting keys reference (for app implementation)

Use these keys when reading from `global` and `user`. All values are strings unless the key is `seerr_credentials` or `nav_drawer_items` (objects).

**Global (device)**

| Key | Meaning | Example values |
|-----|---------|----------------|
| `sign_in_auto` | Sign in automatically | `"true"`, `"false"` |
| `update_url` | URL for app update checks | URL string |
| `max_bitrate` | Max bitrate index 0–22 (see below) | `"0"`–`"22"`, default `"17"` (100 Mbps) |

**User – Sign-in & home**

| Key | Meaning |
|-----|---------|
| `max_homepage_items` | Max items on home page rows (integer string, 5–50) |
| `hide_settings_cog` | Hide settings cog | Boolean string |
| `allow_settings_override` | Allow settings override | Boolean string |
| `rewatch_next_up` | Rewatch next up (boolean string) |
| `backdrop_display` | 0 = Image with dynamic color, 1 = Image only, 2 = None |

**User – Appearance**

| Key | Meaning |
|-----|---------|
| `play_theme_music` | 0=Disabled, 1=Lowest, 2=Low, 3=Medium, 4=High, 5=Full |
| `remember_selected_tab` | Boolean string |
| `app_theme` | 0=Purple, 1=Blue, 2=Green, 3=Orange, 4=Bold Blue, 5=Black |
| `show_clock` | Boolean string |
| `combined_search_results` | Boolean string |
| `nav_drawer_switch_on_focus` | Boolean string |

**User – Playback**

| Key | Meaning |
|-----|---------|
| `skip_forward_preference` | Seconds (integer string) |
| `skip_back_preference` | Seconds (integer string) |
| `skip_back_on_resume_preference` | Seconds; 0 = disabled |
| `hide_controller_timeout` | Milliseconds (integer string) |
| `seek_bar_steps` | Integer string |
| `playback_debug_info` | Boolean string |
| `global_content_scale` | 0=Fit, 1=None, 2=Crop, 3=Fill, 4=Fill Width, 5=Fill Height |
| `one_click_pause` | Boolean string |

**User – Next up & skip**

| Key | Meaning |
|-----|---------|
| `auto_play_next` | Boolean string |
| `auto_play_next_delay` | Seconds; 0 = immediate |
| `show_next_up_when` | 0 = At end of playback, 1 = During end credits/outro |
| `pass_out_protection` | Hours; 0 = disabled |
| `skip_intro_behavior`, `skip_outro_behavior`, etc. | 0=Ignore, 1=Skip automatically, 2=Ask to skip |

**User – Live TV**

| Key | Meaning |
|-----|---------|
| `show_details`, `favorite_channels_at_beginning`, `sort_channels_recently_watched`, `color_code_programs` | Boolean strings |

**User – Subtitle style** (if plugin exposes them in Settings response)

| Key | Meaning |
|-----|---------|
| `font_size`, `font_color`, `bold_font`, `italic_font`, `font_opacity`, `edge_style`, `edge_color`, `edge_size`, `background_style`, `background_color`, `background_opacity`, `subtitle_margin` | As in plugin settings; values are strings (indices or numbers). |

**Max bitrate (global)**

`max_bitrate` is an index 0–22. Map to your bitrate caps (e.g. in bps) as needed; index 17 = 100 Mbps.

---

## 6. Seerr credentials object

When `user.seerr_credentials` is present, it has this shape:

```json
{
  "url": "https://seerr.example.com",
  "authMethod": "API_KEY",
  "username": "",
  "passwordOrApiKey": "<api-key-string>"
}
```

- **url** (required): Seerr server base URL (no trailing slash required).
- **authMethod** (required): `"API_KEY"` | `"JELLYFIN"` | `"LOCAL"`.
- **username**: For LOCAL/JELLYFIN; for API_KEY can be empty.
- **passwordOrApiKey** (required): API key for API_KEY; password for LOCAL/JELLYFIN.

Use this in the app to configure the Seerr client for the current user.

---

## 7. Nav drawer items object

When `user.nav_drawer_items` is present, it has this shape:

```json
{
  "items": [
    { "itemId": "a_favorites", "type": "PINNED" },
    { "itemId": "a_discover", "type": "PINNED" },
    { "itemId": "s_aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", "type": "UNPINNED" }
  ]
}
```

- **items**: Array of `{ itemId: string, type: "PINNED" | "UNPINNED" }`.
- **Order of the array** is the display order in the nav bar.
- **PINNED** = show in the nav bar; **UNPINNED** = under “More” or hidden.
- **Home** and **Search** are not in this list; do not add them as pin options.
- **itemId** values: `a_favorites`, `a_discover`, and `s_<view-uuid>` for library views (from Jellyfin user views). Use the same ids when building your nav list so pin state matches.

---

## 8. Implementation checklist for the Wholphin app

- [ ] **Config (layout):** On home load (or when user changes), call `GET /Wholphin/Config` with the current user (or `userId` query). Parse `layout` and render sections and rows; for system rows use `endpointParams.NativeRow` and `ItemId` (for BecauseYouWatched); for collection rows use `pluginId`.
- [ ] **Settings:** On startup or when entering settings screen, call `GET /Wholphin/Settings` for the current user. If the endpoint returns 404 or is missing, fall back to app defaults and optionally prompt to update the plugin.
- [ ] **Apply settings:** Use the **`user`** object only (ignore `global`; it is empty). The plugin returns effective values: keys that inherit from global already have the global value in `user`. Map string values to your app’s types (booleans, enums, integers) using the key reference above.
- [ ] **Seerr:** If `user.seerr_credentials` exists, configure the Seerr integration (URL, auth method, username, password/API key). If absent, treat Seerr as not configured for that user.
- [ ] **Nav bar:** If `user.nav_drawer_items` exists, use `items` to decide which nav items are pinned and in what order. Build the nav list from the same source (built-in + user views with `s_<uuid>`) so itemIds match. If absent, use default visibility and order.
- [ ] **Errors:** On network or server errors, use cached config/settings if available; otherwise use app defaults.

---

## 9. Plugin implementation note (for the companion repo)

If `GET /Wholphin/Settings` is not yet implemented in the plugin, add an endpoint that:

1. Resolves the user (query `userId` or request context).
2. Loads the plugin configuration (from the same store as AdminConfig).
3. Reads **GlobalSettings** for `global`.
4. Resolves the user’s profile and reads **UserSettings** for `user`.
5. For `user`, parses the JSON strings for `seerr_credentials` and `nav_drawer_items` (if present) and includes them as nested objects in the JSON response.
6. Returns `{ "global": { ... }, "user": { ... } }` with camelCase property names.

This document defines the response contract the app expects.
