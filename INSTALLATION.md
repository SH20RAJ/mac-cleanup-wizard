# Installation Guide for Mac Cleanup Wizard

## 🚨 Gatekeeper Security Warning

If you see **"Apple could not verify Mac Cleanup Wizard is free of malware"** or **"Mac Cleanup Wizard is damaged and can't be opened"**, this is a normal macOS security feature called **Gatekeeper** that protects you from unsigned applications.

### ⚡ **Quick Fix (Method 1 - Recommended)**

1. **Download** the app from [GitHub Releases](https://github.com/SH20RAJ/mac-cleanup-wizard/releases/tag/v1.0.0)
2. **Don't double-click** the downloaded file yet
3. **Open Terminal** (search "Terminal" in Spotlight)
4. **Run this command** (copy and paste):

```bash
xattr -cr ~/Downloads/Mac\ Cleanup\ Wizard*.dmg
```

5. **Now open** the DMG file normally
6. **Drag** the app to Applications folder  
7. **⚠️ IMPORTANT**: **Right-click** on the app in Applications and select **"Open"** (don't double-click!)
8. **Click "Open"** when macOS asks for confirmation

### 🛡️ **Alternative Fix (Method 2)**

If Method 1 doesn't work:

1. **Open System Preferences** → **Security & Privacy**
2. **Download and try to open** the app
3. **Look for a message** about blocked app in Security preferences
4. **Click "Open Anyway"** next to the message
5. **Confirm** by clicking "Open" in the dialog

### 🔧 **For Advanced Users (Method 3)**

Remove the quarantine attribute completely:

```bash
# For DMG file
xattr -d com.apple.quarantine ~/Downloads/Mac\ Cleanup\ Wizard*.dmg

# For the app after installation
sudo xattr -rd com.apple.quarantine /Applications/Mac\ Cleanup\ Wizard.app
```

## 📋 **System Requirements**

- **macOS**: 10.14 (Mojave) or later
- **Architecture**: Apple Silicon (M1/M2/M3) or Intel
- **Permissions**: Full Disk Access (granted after first launch)
- **Storage**: 100MB available space

## 🔐 **Security Information**

### Why does this happen?
- Mac Cleanup Wizard is **open source** and **free**
- We don't have an Apple Developer certificate ($99/year)
- Apple's Gatekeeper blocks unsigned apps by default
- This is a **security feature**, not a virus warning

### Is it safe?
- ✅ **100% Open Source** - [View the code](https://github.com/sh20raj/mac-cleanup-wizard)
- ✅ **No network requests** - Works entirely offline
- ✅ **Files go to Trash** - Nothing permanently deleted
- ✅ **Sandboxed permissions** - Limited system access
- ✅ **Community reviewed** - Public GitHub repository

## 🚀 **Installation Steps**

### Option 1: DMG Installer (Recommended)
1. Download `Mac Cleanup Wizard-1.0.0-arm64.dmg` (for M1/M2/M3 Macs)
2. Run the fix command above
3. Open the DMG file
4. Drag to Applications folder
5. Right-click → Open

### Option 2: ZIP Archive
1. Download `Mac Cleanup Wizard-1.0.0-arm64-mac.zip`
2. Extract the ZIP file
3. Run: `xattr -cr ~/Downloads/Mac\ Cleanup\ Wizard.app`
4. Move to Applications folder
5. Right-click → Open

## 🛠️ **First Launch Setup**

1. **Launch the app** from Applications
2. **Grant permissions** when prompted:
   - Full Disk Access (for comprehensive scanning)
   - File system access (for reading file sizes)
3. **Click "Scan"** to start your first cleanup
4. **Review results** before deleting anything
5. **Enjoy your clean Mac!** 🎉

## ❓ **Troubleshooting**

### Still getting "damaged" error?
```bash
# Remove all extended attributes
sudo find /Applications/Mac\ Cleanup\ Wizard.app -exec xattr -c {} \;
```

### Permission denied errors?
```bash
# Fix permissions
sudo chmod -R 755 /Applications/Mac\ Cleanup\ Wizard.app
```

### App won't start?
1. Check Console.app for error messages
2. Try running from Terminal: `/Applications/Mac\ Cleanup\ Wizard.app/Contents/MacOS/Mac\ Cleanup\ Wizard`
3. Make sure you're on macOS 10.14+

## 🔄 **Future Updates**

We're working on:
- **Code signing** for smoother installation
- **Auto-updater** for seamless updates
- **Homebrew cask** for command-line installation

## 💬 **Need Help?**

- 🐛 **Report issues**: [GitHub Issues](https://github.com/sh20raj/mac-cleanup-wizard/issues)
- 💬 **Ask questions**: [GitHub Discussions](https://github.com/sh20raj/mac-cleanup-wizard/discussions)
- 📧 **Email support**: sh20raj@gmail.com

---

**Remember**: This is open source software. The "damaged" warning is just macOS being protective. The commands above are safe and standard for installing unsigned Mac apps.
