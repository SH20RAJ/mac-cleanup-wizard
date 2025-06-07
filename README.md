# 🧹 Mac Cleanup Wizard

**Mac Cleanup Wizard** is a free and open-source desktop app that helps you identify and safely delete unwanted files, caches, logs, developer junk, and system bloat from your macOS system — all with an organized, intuitive UI.

## 🚨 Installation Note

**Getting "App is damaged" error?** This is normal for unsigned apps. **Quick fix**:

```bash
xattr -cr ~/Downloads/Mac\ Cleanup\ Wizard*.dmg
```

Then **right-click → Open** the app. [📖 Full installation guide](INSTALLATION.md)

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
