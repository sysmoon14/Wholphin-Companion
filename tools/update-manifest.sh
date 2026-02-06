#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:?version required}"
CHECKSUM="${2:?checksum required}"
TIMESTAMP="${3:?timestamp required}"
CHANGELOG="${4:-Automated release.}"

MANIFEST="manifest.json"
SOURCE_URL="https://github.com/sysmoon14/Wholphin-Companion/releases/download/v${VERSION}/Wholphin-Companion_${VERSION}.zip"

jq --arg version "$VERSION" \
   --arg checksum "$CHECKSUM" \
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
           checksum: $checksum,
           timestamp: $timestamp
         }]
       | sort_by(.version)
     )
   )
   ' "$MANIFEST" > "$MANIFEST.tmp"

mv "$MANIFEST.tmp" "$MANIFEST"
