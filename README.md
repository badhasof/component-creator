# Component Creator - Chrome Extension MVP

A Chrome extension that highlights elements on hover when activated with a keyboard shortcut.

## Features

- Toggle element highlighting mode with `Ctrl+Shift+E` (Windows/Linux) or `Cmd+Shift+E` (Mac)
- Blue outline (3px solid) appears on hovered elements
- Tooltip shows element tag name, ID, and classes
- Visual indicator when selection mode is active
- Works on all websites

## Installation

### Loading in Chrome (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`

2. Enable **Developer mode** by toggling the switch in the top-right corner

3. Click **Load unpacked** button

4. Navigate to and select the `/Users/bfuri/projects/componentCreator/dist` folder

5. The extension should now appear in your extensions list

### Verifying Installation

- You should see "Component Creator" in your extensions list
- The extension icon will appear in your toolbar
- Status should show as "Enabled"

## Usage

1. Navigate to any website

2. Press `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac) to activate selection mode

3. A blue indicator will appear in the top-right corner saying "Selection Mode: ON"

4. Hover over any element to see:
   - Blue outline highlighting the element
   - Tooltip showing element information (tag name, ID, classes)

5. Press the keyboard shortcut again to deactivate selection mode

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
cd /Users/bfuri/projects/componentCreator
npm install
```

### Build

```bash
npm run build
```

The extension will be built to the `dist/` folder.

### Development Mode

For live development:

```bash
npm run dev
```

Then load the extension from the `dist/` folder in Chrome.

## Project Structure

```
componentCreator/
├── manifest.json          # Extension manifest (source)
├── vite.config.ts         # Vite configuration with CRXJS plugin
├── package.json           # Project dependencies
├── src/
│   ├── content.tsx        # Main content script (element highlighting logic)
│   └── content.css        # Styles for outline and tooltip
├── public/
│   └── icons/
│       └── icon128.png    # Extension icon
└── dist/                  # Built extension (load this in Chrome)
    ├── manifest.json      # Generated manifest
    ├── content.css        # Compiled styles
    ├── assets/            # Compiled JavaScript
    └── icons/             # Extension icons
```

## Technical Details

- **Framework**: React + TypeScript + Vite
- **Build Tool**: CRXJS Vite Plugin
- **Manifest Version**: 3
- **Permissions**: `activeTab`, `scripting`
- **Content Scripts**: Injected on all URLs

## How It Works

1. The content script (`content.tsx`) is injected into every webpage
2. Listens for the keyboard shortcut (`Ctrl+Shift+E` or `Cmd+Shift+E`)
3. When activated:
   - Adds mouseover/mouseout/mousemove event listeners
   - Applies blue outline class to hovered elements
   - Shows tooltip with element information
   - Displays mode indicator in top-right corner
4. When deactivated:
   - Removes all event listeners
   - Clears highlights and tooltips

## Keyboard Shortcuts

The extension uses Chrome's `commands` API for keyboard shortcuts:

- **Windows/Linux**: `Ctrl + Shift + E`
- **Mac**: `Cmd + Shift + E`

You can customize this in Chrome:
1. Go to `chrome://extensions/shortcuts`
2. Find "Component Creator"
3. Click the pencil icon to change the shortcut

## Troubleshooting

### Extension not loading
- Make sure you're loading the `dist/` folder, not the root project folder
- Check that Developer mode is enabled in `chrome://extensions/`
- Try clicking the "Reload" button on the extension card

### Keyboard shortcut not working
- Check if another extension is using the same shortcut
- Go to `chrome://extensions/shortcuts` to verify/change the shortcut
- Refresh the webpage after loading the extension

### Styles not applying
- Reload the extension in `chrome://extensions/`
- Hard refresh the webpage (Ctrl+Shift+R or Cmd+Shift+R)

### Elements not highlighting
- Open DevTools Console (F12) and check for errors
- Verify "Selection Mode: ON" indicator appears when you press the shortcut
- Some websites with strict Content Security Policies may block the extension

## Future Enhancements (Not in MVP)

- Click to select element
- Copy CSS selector
- Export selected elements
- Component code generation
- Custom highlight colors
- Element inspection panel

## License

MIT

## Version

0.1.0 (MVP)
