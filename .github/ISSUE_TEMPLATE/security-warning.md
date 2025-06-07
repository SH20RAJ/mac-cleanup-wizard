---
name: 🚨 macOS Security Warning
about: Report issues with "Apple could not verify Mac Cleanup Wizard is free of malware" warning
title: '[SECURITY] Gatekeeper warning on macOS'
labels: ['security', 'gatekeeper', 'macos']
assignees: ['SH20RAJ']
---

## 🔍 Issue Description
<!-- Brief description of the security warning you're encountering -->

## 💻 System Information
- **macOS Version**: (e.g., macOS 14.5 Sonoma)
- **Mac Model**: (e.g., MacBook Pro M2, iMac Intel)
- **Download Source**: (e.g., GitHub Releases, direct link)
- **File Downloaded**: (e.g., Mac Cleanup Wizard-1.0.0-arm64.dmg)

## 🚨 Security Warning Details
<!-- Copy the exact error message you're seeing -->

## 🔧 Troubleshooting Steps Tried
<!-- Check all that apply -->
- [ ] Ran `xattr -cr ~/Downloads/Mac\ Cleanup\ Wizard*.dmg`
- [ ] Used right-click → "Open" instead of double-clicking
- [ ] Tried System Preferences → Security & Privacy method
- [ ] Ran the `fix-gatekeeper.sh` script
- [ ] Checked the [troubleshooting guide](https://sh20raj.github.io/mac-cleanup-wizard/troubleshooting.html)

## 📋 Additional Context
<!-- Any additional information that might help resolve the issue -->

---

### 🛡️ Quick Solutions (Try These First)

**Method 1 - Terminal Fix:**
```bash
xattr -cr ~/Downloads/Mac\ Cleanup\ Wizard*.dmg
```

**Method 2 - Right-Click Method:**
1. Right-click the app (don't double-click)
2. Select "Open" from the context menu
3. Click "Open" in the dialog

**Method 3 - System Preferences:**
1. Go to System Preferences → Security & Privacy
2. Look for "Mac Cleanup Wizard was blocked..." message
3. Click "Open Anyway"

**Method 4 - Automated Script:**
```bash
curl -O https://raw.githubusercontent.com/SH20RAJ/mac-cleanup-wizard/main/fix-gatekeeper.sh
chmod +x fix-gatekeeper.sh && ./fix-gatekeeper.sh
```
