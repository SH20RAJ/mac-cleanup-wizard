#!/bin/bash

# Mac Cleanup Wizard - Compatibility Check Script
# This script checks system compatibility before installation

echo "🔍 Mac Cleanup Wizard - System Compatibility Check"
echo "=================================================="

# Check macOS version
macos_version=$(sw_vers -productVersion)
macos_major=$(echo $macos_version | cut -d '.' -f 1)
macos_minor=$(echo $macos_version | cut -d '.' -f 2)

echo "📍 Detected macOS: $macos_version"

# Check if macOS version is supported (macOS 10.15+ recommended)
if [[ $macos_major -ge 11 ]] || [[ $macos_major -eq 10 && $macos_minor -ge 15 ]]; then
    echo "✅ macOS version is compatible"
else
    echo "⚠️  Warning: macOS 10.15 or later is recommended"
fi

# Check architecture
arch=$(uname -m)
echo "📍 Architecture: $arch"

if [[ $arch == "arm64" ]]; then
    echo "✅ Apple Silicon detected - use ARM64 version"
    recommended_file="Mac Cleanup Wizard-1.0.0-arm64.dmg"
elif [[ $arch == "x86_64" ]]; then
    echo "✅ Intel Mac detected - use x64 version"
    recommended_file="Mac Cleanup Wizard-1.0.0.dmg"
else
    echo "⚠️  Unknown architecture detected"
    recommended_file="Mac Cleanup Wizard-1.0.0.dmg"
fi

# Check available disk space
available_space=$(df -h . | awk 'NR==2 {print $4}' | sed 's/[^0-9.]//g')
available_space_raw=$(df . | awk 'NR==2 {print $4}')
available_gb=$((available_space_raw / 1048576))
echo "📍 Available disk space: ${available_gb}GB"

if [[ $available_gb -gt 1 ]]; then
    echo "✅ Sufficient disk space available"
else
    echo "⚠️  Low disk space detected - consider freeing up space first"
fi

# Check for existing quarantine attributes on downloaded files
echo ""
echo "🔒 Checking for quarantine attributes on downloaded files..."

downloads_dir="$HOME/Downloads"
if ls "$downloads_dir"/Mac\ Cleanup\ Wizard*.dmg 1> /dev/null 2>&1; then
    for file in "$downloads_dir"/Mac\ Cleanup\ Wizard*.dmg; do
        if xattr -l "$file" | grep -q "com.apple.quarantine"; then
            echo "⚠️  Quarantine detected on: $(basename "$file")"
            echo "   Run: xattr -cr \"$file\""
        else
            echo "✅ No quarantine on: $(basename "$file")"
        fi
    done
else
    echo "📥 No Mac Cleanup Wizard files found in Downloads"
fi

echo ""
echo "💡 Recommendations:"
echo "1. Download: $recommended_file"
echo "2. If you see security warnings, run: ./fix-gatekeeper.sh"
echo "3. Always right-click the app and select 'Open' (don't double-click)"
echo ""
echo "🚀 Ready to install Mac Cleanup Wizard!"
