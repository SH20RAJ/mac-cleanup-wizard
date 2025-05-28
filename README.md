# 🧹 Mac Cleanup Wizard

**Mac Cleanup Wizard** is a free and open-source desktop app that helps you identify and safely delete unwanted files, caches, logs, developer junk, and system bloat from your macOS system — all with an organized, intuitive UI.

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

## 🧠 Suggested AI Prompt for IDE

> "Build a desktop app using Electron.js and React.js that scans macOS file system for known space-hog folders like node\_modules, Xcode caches, and app data. Organize the results into categories like Developer, Media, Cache, and Misc. Let users preview and delete files/folders with confirmation. Use Node.js to handle filesystem and permission checks. Add optional GPT-based assistant to suggest deletions safely."

---

## 📚 Roadmap

* [ ] Add dark mode UI
* [ ] Add support for Windows & Linux
* [ ] Add scheduling/auto-clean option
* [ ] Integration with AI cleanup assistant
* [ ] Create cleanup scripts for CLI version

---

## 🙌 Contributing

We welcome contributions! See `CONTRIBUTING.md` for setup instructions and guidelines.

---

## 📜 License

This project is licensed under the MIT License.

---

## ❤️ Support

If you like this tool, ⭐ star the repo, suggest ideas, and help spread the word!
