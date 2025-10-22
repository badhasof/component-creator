# Quick Installation Guide

## Load Extension in Chrome

1. Open Chrome browser

2. Navigate to: `chrome://extensions/`

3. Enable **Developer mode** (toggle switch in top-right corner)

4. Click **Load unpacked**

5. Select this folder: `/Users/bfuri/projects/componentCreator/dist`

6. Done! The extension is now loaded.

## Test It

1. Go to any website (e.g., https://google.com)

2. Press `Cmd+Shift+E` (Mac) or `Ctrl+Shift+E` (Windows/Linux)

3. You should see a blue "Selection Mode: ON" indicator in the top-right

4. Hover over any element - it will be highlighted with a blue outline

5. A tooltip will show the element's tag name, ID, and classes

6. Press the shortcut again to turn it off

## Troubleshooting

**Extension won't load:**
- Make sure you selected the `dist` folder, not the root folder
- Check that Developer mode is enabled

**Shortcut doesn't work:**
- Reload the webpage after loading the extension
- Check `chrome://extensions/shortcuts` to verify the shortcut isn't conflicting

**No highlighting:**
- Open DevTools (F12) and check the Console tab for errors
- Try reloading the extension in chrome://extensions

## Customizing the Keyboard Shortcut

1. Go to: `chrome://extensions/shortcuts`
2. Find "Component Creator"
3. Click the pencil icon
4. Set your preferred shortcut
5. Click OK

## Rebuilding After Changes

If you make changes to the source code:

```bash
cd /Users/bfuri/projects/componentCreator
npm run build
```

Then click the "Reload" button on the extension in `chrome://extensions/`
