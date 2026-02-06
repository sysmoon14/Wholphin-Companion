## Wholphin Companion - Release & Manifest

This repo uses a Jellyfin plugin manifest (`manifest.json`) so the plugin can be added as a repository in the Jellyfin UI.

### Build the plugin

```
dotnet build -c Release
```

The build output is copied to:
```
bin/Release/net9.0/Wholphin Companion/
```

### Package the release zip

From the repo root:
```
zip -r "Wholphin-Companion_0.1.0.zip" "bin/Release/net9.0/Wholphin Companion"
```

### Compute SHA256

macOS:
```
shasum -a 256 "Wholphin-Companion_0.1.0.zip"
```

Linux:
```
sha256sum "Wholphin-Companion_0.1.0.zip"
```

### Publish

1. Create a GitHub release `v0.1.0`.
2. Upload `Wholphin-Companion_0.1.0.zip` to the release assets.
3. Update `manifest.json`:
   - `sourceUrl` should match the release asset URL.
   - `checksum` should be the SHA256 from above.
   - `timestamp` should be ISO8601 UTC.
4. Commit and push.

### Add repo in Jellyfin

Dashboard → Plugins → Repositories → Add:

```
https://raw.githubusercontent.com/sysmoon14/Wholphin-Companion/main/manifest.json
```

