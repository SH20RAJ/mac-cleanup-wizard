# 🧹 Mac Storage Hog Audit – README

This document lists **potential storage occupiers on macOS**. These are common folders, files, caches, and apps that may consume a significant amount of disk space over time.

---

## 🧑‍💻 For Developers

### 📦 Node.js / JavaScript

* `/node_modules/` (inside projects)
* `~/.npm/` (NPM cache)
* `~/.yarn/` (Yarn cache)
* `~/.pnpm-store/` (PNPM cache)
* `~/.nvm/versions/` (Node versions if using NVM)
* Global NPM modules: `npm list -g`

### 🐍 Python

* `~/.virtualenvs/` (virtual environments - if using `virtualenv` or `pipenv`)
* `~/anaconda3/` (if using Anaconda)
* `~/miniconda3/`
* `__pycache__/` folders in Python projects
* Jupyter cache and notebooks

### 🐳 Docker

* Docker images, containers, and volumes
* `~/Library/Containers/com.docker.docker/`
* Docker Desktop's internal disk

### 🧪 Xcode & Dev Tools

* `~/Library/Developer/Xcode/DerivedData/`
* `~/Library/Developer/CoreSimulator/Devices/`
* `~/Library/Developer/XCPGDevices/`
* `~/Library/Caches/com.apple.dt.Xcode/`
* iOS Device backups

### ⚙️ Homebrew

* `/usr/local/Cellar/`
* `/opt/homebrew/Cellar/` (Apple Silicon)
* `/Library/Caches/Homebrew/`

---

## 🌐 General Caches & Temp Files

### 🌐 Web Browsers

* **Chrome**: `~/Library/Application Support/Google/Chrome/`
* **Safari**: `~/Library/Safari/` and `~/Library/Caches/com.apple.Safari/`
* **Firefox**: `~/Library/Application Support/Firefox/`
* Web Worker storage (e.g. YouTube):
  `~/Library/Caches/com.google.Chrome/Default/Service Worker/`

### 💬 Messaging & Collaboration Tools

* Slack: `~/Library/Application Support/Slack/`
* Discord: `~/Library/Application Support/discord/`
* Microsoft Teams, Zoom, etc.

### 💌 Mail

* `~/Library/Mail/`
* `~/Library/Containers/com.apple.mail/`
* Mail attachments and old messages

### 📩 Downloads Folder

* `~/Downloads/` – common for videos, installers, and large files

---

## 📦 System, Apps & Misc

### 🗑 Trash

* `~/.Trash/`

### 📁 Large Files

* Use `Finder` → `Cmd + F` → Filter by `File Size` and `Kind`

### 📂 "Other" Storage in Disk Usage

* App extensions
* Application support data
* Fonts, logs, old updates

### 🧾 Log Files

* `~/Library/Logs/`
* `/Library/Logs/`

### 💿 Time Machine Local Snapshots

* `/Volumes/com.apple.TimeMachine.localsnapshots/`

### 💡 Spotlight Index

* `/var/folders/` – includes caches, index databases, etc.

---

## 🎬 Media & Creative Software

### 🎵 iTunes / Music

* `~/Music/iTunes/iTunes Media/`

### 🎥 iMovie / Final Cut Pro

* Render files, libraries, and caches

### 📸 Photos

* `~/Pictures/Photos Library.photoslibrary/`

---

## 🧰 System Tools & Others

### 🧮 Virtualization

* Parallels, VMWare, VirtualBox images (huge disk files)

### ⌨️ Emulators & IDEs

* Android Studio: `~/Library/Android/sdk/`
* VSCode extensions: `~/.vscode/`
* IntelliJ, PyCharm caches

### 🧱 Design Tools

* Figma, Sketch, Adobe caches and projects

---

## 📂 Common Folders to Inspect

| Folder                           | Description                        |
| -------------------------------- | ---------------------------------- |
| `~/Library/Caches/`              | General app cache                  |
| `/Library/Caches/`               | System-wide cache (admin required) |
| `~/Library/Application Support/` | App data (often large)             |
| `~/Library/Preferences/`         | User settings (small)              |
| `~/Library/Logs/`                | App/system logs                    |
| `~/.Trash/`                      | Deleted files not yet purged       |
| `~/Movies/`, `~/Pictures/`       | Common for large personal media    |

---

This list gives you a **holistic view of what might be bloating your Mac**. It’s great for building a cleanup script, audit tool, or even a GUI app for end users and developers alike.

