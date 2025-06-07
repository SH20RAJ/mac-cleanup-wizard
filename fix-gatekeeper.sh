#!/bin/bash

# Mac Cleanup Wizard - Enhanced Gatekeeper Fix Script
# This script fixes the "App is damaged" and "unverified developer" errors

echo "🧹 Mac Cleanup Wizard - Gatekeeper Fix v2.0"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_step() {
    echo -e "${PURPLE}🔧${NC} $1"
}

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is only for macOS systems."
    exit 1
fi

print_info "Detecting Mac Cleanup Wizard installation issues..."
echo ""

# Function to fix quarantine attributes
fix_quarantine() {
    local file_path="$1"
    local file_type="$2"
    
    print_step "Fixing $file_type: $(basename "$file_path")"
    
    # Check if file has quarantine attribute
    if xattr "$file_path" | grep -q "com.apple.quarantine"; then
        print_warning "File has quarantine attribute - removing..."
        xattr -d com.apple.quarantine "$file_path" 2>/dev/null
        
        # If that fails, try comprehensive removal
        if [[ $? -ne 0 ]]; then
            print_step "Trying comprehensive quarantine removal..."
            xattr -cr "$file_path"
        fi
        
        # Verify removal
        if ! xattr "$file_path" | grep -q "com.apple.quarantine"; then
            print_status "Quarantine attribute removed successfully!"
            return 0
        else
            print_error "Failed to remove quarantine attribute"
            return 1
        fi
    else
        print_status "$file_type already clean (no quarantine attribute)"
        return 0
    fi
}

# Search for Mac Cleanup Wizard files in common locations
print_info "Searching for Mac Cleanup Wizard files..."

# Check Downloads folder
DMG_FILES=($(find ~/Downloads -name "*Mac*Cleanup*Wizard*.dmg" -type f 2>/dev/null))
ZIP_FILES=($(find ~/Downloads -name "*Mac*Cleanup*Wizard*.zip" -type f 2>/dev/null))
APP_FILES=($(find ~/Downloads -name "*Mac*Cleanup*Wizard*.app" -type d 2>/dev/null))

# Check Applications folder
APP_IN_APPLICATIONS=$(find /Applications -name "*Mac*Cleanup*Wizard*.app" -type d 2>/dev/null | head -1)

# Check current directory (for developers)
DMG_IN_DIST=($(find ./dist -name "*.dmg" -type f 2>/dev/null))

echo ""

# Fix DMG files
if [[ ${#DMG_FILES[@]} -gt 0 ]]; then
    for dmg in "${DMG_FILES[@]}"; do
        fix_quarantine "$dmg" "DMG file"
    done
else
    print_info "No DMG files found in Downloads"
fi

# Fix ZIP files  
if [[ ${#ZIP_FILES[@]} -gt 0 ]]; then
    for zip in "${ZIP_FILES[@]}"; do
        fix_quarantine "$zip" "ZIP file"
    done
else
    print_info "No ZIP files found in Downloads"
fi

# Fix APP files in Downloads
if [[ ${#APP_FILES[@]} -gt 0 ]]; then
    for app in "${APP_FILES[@]}"; do
        fix_quarantine "$app" "App bundle"
    done
else
    print_info "No app bundles found in Downloads"
fi

# Fix app in Applications
if [[ -n "$APP_IN_APPLICATIONS" ]]; then
    print_info "Found app in Applications folder"
    fix_quarantine "$APP_IN_APPLICATIONS" "Installed app"
else
    print_info "No app found in Applications folder"
fi

# Fix DMG files in dist (for developers)
if [[ ${#DMG_IN_DIST[@]} -gt 0 ]]; then
    print_info "Found DMG files in dist folder (developer mode)"
    for dmg in "${DMG_IN_DIST[@]}"; do
        fix_quarantine "$dmg" "Development DMG"
    done
fi

echo ""
print_info "Additional Security Bypass Instructions:"
echo ""
echo "📋 After running this script:"
echo "   1. Open the DMG file normally"
echo "   2. Drag Mac Cleanup Wizard to Applications"
echo "   3. ⚠️  IMPORTANT: Right-click the app and select 'Open'"
echo "   4. Click 'Open' when macOS shows the security warning"
echo ""

echo "🔐 If you still see security warnings:"
echo "   1. Go to System Preferences → Security & Privacy"
echo "   2. Look for a message about Mac Cleanup Wizard"
echo "   3. Click 'Open Anyway'"
echo ""

print_info "Why this happens:"
echo "   • Apple requires a \$99/year certificate for code signing"
echo "   • Mac Cleanup Wizard is free and open-source"
echo "   • The app is completely safe - check the source code!"
echo ""

print_status "Happy cleaning! 🧹"
