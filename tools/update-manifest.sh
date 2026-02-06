#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:?version required}"
SHA256="${2:?sha256 required}"
TIMESTAMP="${3:?timestamp required}"
CHANGELOG="${4:-Automated release.}"

MANIFEST="manifest.json"
SOURCE_URL="https://github.com/sysmoon14/Wholphin-Companion/releases/download/v${VERSION}/Wholphin-Companion_${VERSION}.zip"

jq --arg version "$VERSION" \
   --arg sha256 "$SHA256" \
   --arg timestamp "$TIMESTAMP" \
   --arg sourceUrl "$SOURCE_URL" \
   --arg changelog "$CHANGELOG" \
   '
   map(
     .versions = (
       .versions
       | map(select(.version != $version))
         + [{
           version: $version,
           changelog: $changelog,
           targetAbi: "10.11.6.0",
           sourceUrl: $sourceUrl,
           checksum: $sha256,
           timestamp: $timestamp
         }]
       | sort_by(.version)
     )
   )
   ' "$MANIFEST" > "$MANIFEST.tmp"

mv "$MANIFEST.tmp" "$MANIFEST"
