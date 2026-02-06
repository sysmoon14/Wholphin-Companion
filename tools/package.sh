#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-0.1.0}"
OUTPUT="Wholphin-Companion_${VERSION}.zip"
BUILD_DIR="bin/Release/net9.0/Wholphin Companion"

if [ ! -d "$BUILD_DIR" ]; then
  echo "Build directory not found: $BUILD_DIR"
  echo "Run: dotnet build -c Release"
  exit 1
fi

rm -f "$OUTPUT"
zip -r "$OUTPUT" "$BUILD_DIR"

echo "Created: $OUTPUT"
