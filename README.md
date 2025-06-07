# 🧹 Mac Cleanup Wizard

[![macOS](https://img.shields.io/badge/macOS-10.15+-blue?logo=apple)](https://www.apple.com/macos/)
[![Electron](https://img.shields.io/badge/Electron-25.0+-9feaf9?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2+-61dafb?logo=react)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Security](https://img.shields.io/badge/Security-Open%20Source-brightgreen)](https://github.com/SH20RAJ/mac-cleanup-wizard)
[![Downloads](https://img.shields.io/github/downloads/sh20raj/mac-cleanup-wizard/total)](https://github.com/SH20RAJ/mac-cleanup-wizard/releases)

**Mac Cleanup Wizard** is a free and open-source desktop app that helps you identify and safely delete unwanted files, caches, logs, developer junk, and system bloat from your macOS system — all with an organized, intuitive UI.

## 🚨 macOS Security Warning

**Seeing "Apple could not verify Mac Cleanup Wizard is free of malware"?** This is normal for unsigned open-source apps.

### ⚡ Instant Fix

```bash
xattr -cr ~/Downloads/Mac\ Cleanup\ Wizard*.dmg
```

Then **right-click the app → "Open"** (don't double-click!)

### 🛡️ Why This Happens

- Apple requires a $99/year developer certificate to avoid this warning
- As a free open-source project, we don't have Apple code signing
- **The app is completely safe** - you can review the [source code](https://github.com/SH20RAJ/mac-cleanup-wizard)

📖 **Still having issues?** Check our [complete installation guide](INSTALLATION.md) with multiple fix methods.

---

## 🚀 Quick Start

### 1. Check Compatibility
```bash
# Download and run compatibility check
curl -O https://raw.githubusercontent.com/SH20RAJ/mac-cleanup-wizard/main/check-compatibility.sh
chmod +x check-compatibility.sh && ./check-compatibility.sh
```

### 2. Download & Install
1. **Download** the appropriate version:
   - **Apple Silicon (M1/M2/M3)**: `Mac Cleanup Wizard-1.0.0-arm64.dmg`
   - **Intel Mac**: `Mac Cleanup Wizard-1.0.0.dmg`

2. **Fix Security Warning** (if needed):
   ```bash
   xattr -cr ~/Downloads/Mac\ Cleanup\ Wizard*.dmg
   ```

3. **Install**: Double-click the DMG and drag to Applications

4. **First Launch**: Right-click the app → "Open" (don't double-click!)

### 3. Start Cleaning
🎉 **You're ready!** The app will guide you through identifying and safely removing unnecessary files.

---

## 📸 Screenshots

<div align="center">
  <img src="docs/screenshots/poster.png" alt="Mac Cleanup Wizard - Main Interface" width="800">
  <p><em>Mac Cleanup Wizard - Clean Your Mac Like a Pro</em></p>
</div>

<table>
  <tr>
    <td align="center">
      <img src="docs/screenshots/Screenshot 2025-06-07 at 10.47.34 AM.png" alt="Main Dashboard" width="400">
      <br><strong>Main Dashboard</strong>
      <br><em>Organized file categories with sizes</em>
    </td>
    <td align="center">
      <img src="docs/screenshots/Screenshot 2025-06-07 at 10.47.44 AM.png" alt="Developer Files" width="400">
      <br><strong>Developer Files Scan</strong>
      <br><em>Node.js, Python, Xcode cleanup</em>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="docs/screenshots/Screenshot 2025-06-07 at 10.47.51 AM.png" alt="Storage Analysis" width="400">
      <br><strong>Storage Analysis</strong>
      <br><em>Visual disk usage breakdown</em>
    </td>
    <td align="center">
      <img src="docs/screenshots/Screenshot 2025-06-07 at 10.48.17 AM.png" alt="Cleanup Progress" width="400">
      <br><strong>Cleanup Progress</strong>
      <br><em>Real-time cleanup results</em>
    </td>
  </tr>
</table>

---

## 🎯 Purpose

Over time, macOS can get cluttered with:

- `node_modules/`
- Python virtual environments
- Xcode derived data
- NPM/Yarn caches
- Mail attachments
- Chrome service workers
- Docker containers/images
- Unused apps and large media files

...and more!

This app provides an **organized and visual approach** to clean these intelligently, with safety checks, size previews, and one-click deletion.

---

## ✨ Features

- 📁 Category-wise listing: Developer Files, Cache, Apps, Logs, Media, Downloads, and more
- 🧠 AI Assistant: Suggests what can be safely removed
- 🗂 File size sorter and preview
- 🗑 Trash bin visualizer
- 🔐 Admin permission prompt where needed
- 📦 One-click cleanup for selected categories
- 🧪 Dry-run mode (see what would be deleted)

---

## 📁 Categories Covered

- **Developer Junk**
  - `node_modules/`, `.venv/`, Xcode derived data, Docker volumes
- **Cache & Temp Files**
  - App caches, browser storage, system logs
- **Media & Downloads**
  - Large videos, old screenshots, downloads
- **App Data**
  - Old app support files and leftover data
- **Miscellaneous**
  - iOS backups, Spotlight index, Time Machine snapshots
- **Trash Management**

---

## 🛠️ Tech Stack

- **Frontend:** Electron.js + React.js
- **Backend / Scripts:** Node.js (with native modules for file ops)
- **Permissions:** macOS elevated shell access (via `sudo`)
- **AI Assistant (optional):** OpenAI GPT-4 or local LLM for suggestions

---

## 📦 Download & Installation

### 🎯 Quick Download

**Latest Release:** [v1.0.0](https://github.com/SH20RAJ/mac-cleanup-wizard/releases/tag/v1.0.0)

| Architecture | DMG Installer | ZIP Archive |
|-------------|---------------|-------------|
| **Apple Silicon** (M1/M2/M3) | [Download DMG](https://github.com/SH20RAJ/mac-cleanup-wizard/releases/download/v1.0.0/Mac.Cleanup.Wizard-1.0.0-arm64.dmg) | [Download ZIP](https://github.com/SH20RAJ/mac-cleanup-wizard/releases/download/v1.0.0/Mac.Cleanup.Wizard-1.0.0-arm64-mac.zip) |
| **Intel** (x64) | [Download DMG](https://github.com/SH20RAJ/mac-cleanup-wizard/releases/download/v1.0.0/Mac.Cleanup.Wizard-1.0.0.dmg) | [Download ZIP](https://github.com/SH20RAJ/mac-cleanup-wizard/releases/download/v1.0.0/Mac.Cleanup.Wizard-1.0.0-mac.zip) |

### 🛠️ Installation Steps

1. **Download** the appropriate version for your Mac
2. **Fix Gatekeeper** (required for unsigned apps):
   ```bash
   xattr -cr ~/Downloads/Mac\ Cleanup\ Wizard*.dmg
   ```
3. **Install**: Open DMG and drag to Applications
4. **First Launch**: Right-click app → "Open" (important!)

### 🔧 Auto-Fix Script

Download and run our fix script:
```bash
curl -fsSL https://raw.githubusercontent.com/SH20RAJ/mac-cleanup-wizard/main/fix-gatekeeper.sh | bash
```

📖 **Having issues?** Check the [complete installation guide](INSTALLATION.md).

---

## 🚀 Getting Started

### Prerequisites

- macOS 11 or later
- Node.js (v18+)
- NPM or Yarn

### Clone & Install

```bash
git clone https://github.com/sh20raj/mac-cleanup-wizard.git
cd mac-cleanup-wizard
npm install
````

### Run in Development

```bash
npm run dev
```

### Build for macOS

```bash
npm run build
```

---

## 🙌 Contributing

We welcome contributions! See `CONTRIBUTING.md` for setup instructions and guidelines.

---

## 📜 License

This project is licensed under the MIT License.

---

## ❤️ Support

If you like this tool, ⭐ star the repo, suggest ideas, and help spread the word!
