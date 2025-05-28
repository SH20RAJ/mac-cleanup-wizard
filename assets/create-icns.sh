#!/bin/bash

# Exit on error
set -e

# Define paths
ASSETS_DIR="$(dirname "$0")"
SVG_ICON="$ASSETS_DIR/icon.svg"
ICONSET_DIR="$ASSETS_DIR/AppIcon.iconset"
ICNS_FILE="$ASSETS_DIR/icon.icns"

# Create temporary directory for the iconset
mkdir -p "$ICONSET_DIR"

# Check if the SVG exists
if [ ! -f "$SVG_ICON" ]; then
  echo "Error: SVG icon not found at $SVG_ICON"
  exit 1
fi

# Generate PNG icons at different sizes using sips
echo "Converting SVG to PNGs at various sizes..."

# Use rsvg-convert if available, otherwise try other methods
if command -v rsvg-convert &> /dev/null; then
  echo "Using rsvg-convert..."
  TEMP_PNG="$ASSETS_DIR/temp-icon.png"
  rsvg-convert -h 1024 -w 1024 "$SVG_ICON" -o "$TEMP_PNG"
  
  # Generate different sizes
  sips -z 16 16 "$TEMP_PNG" --out "$ICONSET_DIR/icon_16x16.png" &> /dev/null
  sips -z 32 32 "$TEMP_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png" &> /dev/null
  sips -z 32 32 "$TEMP_PNG" --out "$ICONSET_DIR/icon_32x32.png" &> /dev/null
  sips -z 64 64 "$TEMP_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png" &> /dev/null
  sips -z 128 128 "$TEMP_PNG" --out "$ICONSET_DIR/icon_128x128.png" &> /dev/null
  sips -z 256 256 "$TEMP_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png" &> /dev/null
  sips -z 256 256 "$TEMP_PNG" --out "$ICONSET_DIR/icon_256x256.png" &> /dev/null
  sips -z 512 512 "$TEMP_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png" &> /dev/null
  sips -z 512 512 "$TEMP_PNG" --out "$ICONSET_DIR/icon_512x512.png" &> /dev/null
  sips -z 1024 1024 "$TEMP_PNG" --out "$ICONSET_DIR/icon_512x512@2x.png" &> /dev/null
  
  # Clean up temporary PNG
  rm "$TEMP_PNG"
  
else
  # Try using Preview.app if rsvg-convert is not available
  echo "rsvg-convert not found, using sips directly with the SVG..."
  
  # Check if sips can handle SVG (macOS can be temperamental with this)
  if sips -s format png "$SVG_ICON" --out "$ASSETS_DIR/test.png" &> /dev/null; then
    rm "$ASSETS_DIR/test.png"
    
    TEMP_PNG="$ASSETS_DIR/temp-icon.png"
    sips -s format png "$SVG_ICON" --out "$TEMP_PNG" &> /dev/null
    
    # Generate different sizes
    sips -z 16 16 "$TEMP_PNG" --out "$ICONSET_DIR/icon_16x16.png" &> /dev/null
    sips -z 32 32 "$TEMP_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png" &> /dev/null
    sips -z 32 32 "$TEMP_PNG" --out "$ICONSET_DIR/icon_32x32.png" &> /dev/null
    sips -z 64 64 "$TEMP_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png" &> /dev/null
    sips -z 128 128 "$TEMP_PNG" --out "$ICONSET_DIR/icon_128x128.png" &> /dev/null
    sips -z 256 256 "$TEMP_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png" &> /dev/null
    sips -z 256 256 "$TEMP_PNG" --out "$ICONSET_DIR/icon_256x256.png" &> /dev/null
    sips -z 512 512 "$TEMP_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png" &> /dev/null
    sips -z 512 512 "$TEMP_PNG" --out "$ICONSET_DIR/icon_512x512.png" &> /dev/null
    sips -z 1024 1024 "$TEMP_PNG" --out "$ICONSET_DIR/icon_512x512@2x.png" &> /dev/null
    
    # Clean up temporary PNG
    rm "$TEMP_PNG"
  else
    echo "Error: Cannot convert SVG using sips. Please install rsvg-convert or manually convert the SVG to PNG."
    exit 1
  fi
fi

# Convert the iconset to .icns file
echo "Converting iconset to .icns format..."
iconutil -c icns "$ICONSET_DIR" -o "$ICNS_FILE"

# Clean up the temporary iconset directory
rm -rf "$ICONSET_DIR"

echo "Icon successfully created at $ICNS_FILE"
