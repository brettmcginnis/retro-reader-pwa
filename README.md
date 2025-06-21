# Retro Reader PWA

A Progressive Web App for reading and bookmarking retro game guides, optimized for monospace text content.

## Features

- **Offline-First**: Download and store guides locally for offline reading
- **URL Import**: Fetch guides from any URL (plain text format)
- **Bookmark System**: Save reading positions and create custom bookmarks with notes
- **Import/Export**: Backup and share your guide collections
- **Monospace Optimized**: Perfect for ASCII art and formatted text guides
- **Search**: Find content within guides quickly
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for comfortable reading

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Usage

### Adding Guides

**From URL (direct text files):**
1. Click "From URL" tab
2. Enter a URL to a plain text guide and click "Fetch Guide"

**From GameFAQs or other sites (paste method):**
1. Click "Paste Content" tab
2. Copy the full text from GameFAQs or any guide site
3. Click "Paste Guide Content" and fill in the details
4. Paste the content and save

### Reading & Navigation
1. **Read**: Click "Read" to open the guide in the monospace reader
2. **Navigate**: Use arrow keys, page up/down, or click line numbers to navigate
3. **Search**: Use Ctrl/Cmd+F to search within the current guide
4. **Bookmark**: Use Ctrl/Cmd+B while reading or click the bookmark button to save your position
5. **Export**: Share guides or create backups using the export functions

## Keyboard Shortcuts

- `Ctrl/Cmd + F`: Open search
- `Ctrl/Cmd + B`: Add bookmark
- `Arrow Up/Down`: Navigate by line
- `Page Up/Down`: Navigate by page
- `Escape`: Return to library

## Supported Sources

### ✅ URL Import (works)
- Direct text file URLs (.txt)
- GitHub raw files (`raw.githubusercontent.com`)
- Pastebin raw links
- Personal file servers

### ❌ CORS-Blocked Sites (use paste method)
- GameFAQs guide pages
- Most gaming websites
- Protected content sites

### 📋 Paste Import (works for any site)
- Copy/paste from any website
- GameFAQs guides
- Forum posts
- Any text content

## Export Formats
- **JSON**: Complete guide with metadata and bookmarks
- **Plain Text**: Guide content only
- **Backup**: Full collection with all data

## Technologies

- TypeScript
- Vite
- IndexedDB (via idb)
- Service Workers
- CSS Grid/Flexbox
- PWA Manifest

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
```