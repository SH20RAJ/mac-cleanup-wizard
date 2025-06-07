#!/bin/bash

# Mac Cleanup Wizard - Gatekeeper Fix Script
# This script fixes the "App is damaged" error for Mac Cleanup Wizard

echo "🧹 Mac Cleanup Wizard - Gatekeeper Fix"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is only for macOS systems."
    exit 1
fi

echo "This script will fix the 'App is damaged' error for Mac Cleanup Wizard."
echo "The error occurs because the app is not code-signed with an Apple certificate."
echo ""

# Find Mac Cleanup Wizard files in Downloads
DMG_FILE=$(find ~/Downloads -name "Mac Cleanup Wizard*.dmg" -type f 2>/dev/null | head -1)
ZIP_FILE=$(find ~/Downloads -name "Mac Cleanup Wizard*.zip" -type f 2>/dev/null | head -1)
APP_FILE=$(find ~/Downloads -name "Mac Cleanup Wizard.app" -type d 2>/dev/null | head -1)

if [[ -n "$DMG_FILE" ]]; then
    print_info "Found DMG file: $(basename "$DMG_FILE")"
    echo "Removing quarantine attribute from DMG..."
    xattr -cr "$DMG_FILE"
    if [[ $? -eq 0 ]]; then
        print_status "DMG file fixed! You can now open it safely."
    else
        print_error "Failed to fix DMG file. Try running with sudo."
    fi
fi

if [[ -n "$ZIP_FILE" ]]; then
    print_info "Found ZIP file: $(basename "$ZIP_FILE")"
    echo "Removing quarantine attribute from ZIP..."
    xattr -cr "$ZIP_FILE"
    if [[ $? -eq 0 ]]; then
        print_status "ZIP file fixed!"
    else
        print_error "Failed to fix ZIP file. Try running with sudo."
    fi
fi

if [[ -n "$APP_FILE" ]]; then
    print_info "Found app: $(basename "$APP_FILE")"
    echo "Removing quarantine attribute from app..."
    xattr -cr "$APP_FILE"
    if [[ $? -eq 0 ]]; then
        print_status "App file fixed!"
    else
        print_error "Failed to fix app file. Try running with sudo."
    fi
fi

# Check if app is installed in Applications
INSTALLED_APP="/Applications/Mac Cleanup Wizard.app"
if [[ -d "$INSTALLED_APP" ]]; then
    print_info "Found installed app in Applications folder."
    echo "Fixing installed app..."
    xattr -cr "$INSTALLED_APP" 2>/dev/null
    sudo xattr -cr "$INSTALLED_APP" 2>/dev/null
    if [[ $? -eq 0 ]]; then
        print_status "Installed app fixed!"
    else
        print_warning "May need admin privileges. Try: sudo xattr -cr '$INSTALLED_APP'"
    fi
fi

echo ""
echo "🎉 Fix complete! Instructions:"
echo ""
echo "1. Open the DMG file (double-click)"
echo "2. Drag Mac Cleanup Wizard to Applications"
echo "3. Right-click the app in Applications → 'Open'"
echo "4. Click 'Open' when macOS asks for confirmation"
echo ""
print_warning "Important: Always use 'Right-click → Open' for the first launch!"
echo ""
print_info "If you still have issues, check the full guide:"
print_info "https://github.com/SH20RAJ/mac-cleanup-wizard/blob/main/INSTALLATION.md"
echo ""
print_status "Happy cleaning! 🧹"
