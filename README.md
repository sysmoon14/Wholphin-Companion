## Wholphin Companion

Wholphin Companion is a Jellyfin plugin that exposes a lightweight, server-managed "recipe" describing the Wholphin Home layout. The plugin allows admins to build sections and rows in the Jellyfin dashboard and serves that configuration to Wholphin clients via a simple API.

## Features

- Global and user-specific layouts
- Section and row builder UI in Jellyfin
- Native rows and collection rows
- Shuffled rows per section (server-side)
- Lightweight JSON response (no media items)

## API

`GET /Wholphin/Config`

Optional query:
- `userId=<JellyfinUserId>`

Response includes `Layout` sections and rows with `endpointParams`.

## Development

Build:
```
dotnet build -c Release
```

Output is copied to:
```
bin/Release/net9.0/Wholphin Companion/
```

## Repository Manifest

This repo includes `manifest.json` so it can be added as a Jellyfin plugin repository.

Add in Jellyfin:
```
https://raw.githubusercontent.com/sysmoon14/Wholphin-Companion/main/manifest.json
```

See `README_PUBLISH.md` for release steps.

