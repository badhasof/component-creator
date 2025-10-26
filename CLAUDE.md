# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome Extension (Manifest v3) that allows users to inspect elements on any webpage, view their styles, and convert them to React components with Tailwind CSS. The extension highlights elements on hover and provides a modal inspector with multiple views.

**Key Tech Stack:**
- React 19 + TypeScript
- Vite + CRXJS (Chrome extension build tooling)
- Tailwind CSS 4
- Google Gemini AI (for code generation)
- Content scripts injected on all pages

## Development Commands

### Build and Development
```bash
# Start development server with hot reload
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Loading Extension in Chrome
1. Build the extension: `npm run dev` or `npm run build`
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist/` folder
5. Reload extension after code changes

**Important:** Always load the `dist/` folder, not the root project directory.

## Architecture Overview

### Extension Structure

The extension has three main components that work together:

1. **Background Service Worker** (`src/background.ts`)
   - Listens for keyboard command `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac)
   - Broadcasts toggle messages to all open tabs
   - Handles chrome.commands API integration

2. **Content Script** (`src/content.tsx`)
   - Injected into every webpage via manifest
   - Manages element selection mode (hover highlighting, tooltips, click handling)
   - Creates and manages the StyleInspector modal
   - Handles keyboard shortcuts (Cmd/Ctrl+Shift+E to toggle, Shift for parent selection, ESC to close)
   - Uses React portals to render modal in page context

3. **StyleInspector Component** (`src/components/StyleInspector.tsx`)
   - 4-tab interface: Styling, HTML, React, Code Generation
   - Auto-converts HTML elements to React/JSX with Tailwind classes
   - Uses Gemini AI to generate clean React components
   - Includes live preview iframe using sandbox.html

### Key Architectural Patterns

**Element Selection System:**
- Selection mode is toggled via keyboard shortcut
- Blue outline highlights hovered elements
- Tooltip shows element selector (tag#id.classes)
- Shift key enables parent element selection
- Click opens modal inspector (prevents default action)
- All custom elements use `cc-` prefix to avoid conflicts

**HTML to React Conversion:**
- Computed styles are extracted via `window.getComputedStyle()`
- CSS properties mapped to Tailwind utilities (colors, spacing, typography, layout)
- Intelligent color detection using RGB distance algorithm
- Spacing converted to Tailwind scale (0, 0.5, 1, 2, 4, etc.)
- SVG attributes converted to React camelCase (strokeWidth, strokeLinecap, etc.)
- Relative URLs converted to absolute (src, href, srcset, background-image)
- Inline styles only used when no Tailwind equivalent exists

**Sandboxed Preview System:**
- `sandbox.html` provides isolated environment for rendering generated components
- Loads React, ReactDOM, Babel, and Tailwind from vendor files
- Parent-child communication via postMessage API
- Babel transforms JSX/TypeScript on-the-fly in browser
- Props auto-generated based on TypeScript interface detection

### File Organization

```
src/
├── content.tsx              # Main content script (element highlighting & modal)
├── background.ts            # Background service worker (keyboard commands)
├── components/
│   ├── StyleInspector.tsx   # Inspector modal component
│   └── ui/                  # Radix UI components (popover, tabs)
├── lib/
│   └── utils.ts             # Utility functions (cn for class merging)
└── App.tsx                  # Unused (extension doesn't use popup)

public/
├── icons/                   # Extension icons
└── vendor/                  # React, Babel, Tailwind for sandbox

dist/                        # Build output (load this in Chrome)
```

### Important Implementation Details

**Content Script Injection:**
- Content script runs in "isolated world" separate from page scripts
- Can access page DOM but not page JavaScript variables
- Custom CSS classes prefixed with `cc-` (cc-tooltip, cc-modal-container, etc.)
- Uses high z-index (2147483646) to ensure visibility

**Gemini AI Integration:**
- Requires VITE_GEMINI_API_KEY environment variable
- Two models available: gemini-2.5-flash (recommended) and gemini-2.5-flash-lite
- Prompt engineered to prioritize Tailwind over inline styles
- Preserves exact HTML structure, text content, and attributes
- Extracts code from markdown code blocks in response

**Tailwind Conversion Logic:**
- Uses mapping tables for common values (fontSize, fontWeight, colors, spacing)
- Smart detection for border, padding, margin (handles individual sides)
- Falls back to arbitrary values `[value]` when no utility exists
- Color distance algorithm finds closest Tailwind palette color (threshold: 50)
- Spacing tolerance: ±2px for mapping to Tailwind scale

## Environment Variables

Create a `.env` file in the root:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

**Important:** The Gemini API key is required for the "Code Generation" tab functionality.

## Common Development Tasks

### Adding New CSS → Tailwind Mappings
Edit `src/components/StyleInspector.tsx`, function `cssToTailwind()`. Add new property mappings following existing patterns.

### Modifying AI Prompt
Edit the `generateCode()` function in `src/components/StyleInspector.tsx`. The prompt is around line 855.

### Changing Keyboard Shortcuts
1. Update `manifest.json` commands section (for background worker)
2. Update `src/content.tsx` keyboard listener (for fallback)

### Updating Highlight Styles
Edit `src/content.css` (look for `.cc-highlight-outline`, `.cc-tooltip`, `.cc-mode-indicator`)

### Debugging Content Script
- Open DevTools on target webpage (not extension popup)
- Check console for "Component Creator loaded!" message
- Logs are prefixed with context (e.g., "showStyleInspector called")

## Known Quirks and Gotchas

1. **Sandbox Preview Limitations:** Preview iframe uses sandboxed environment with limited CSS. Some complex layouts may not render identically.

2. **Content Security Policy:** Some websites with strict CSP may block the extension. This is expected behavior for security reasons.

3. **Vite HMR:** When running `npm run dev`, you must reload the extension in `chrome://extensions/` after code changes to see updates.

4. **Modal Positioning:** Modal is always centered (fixed 50%/50% transform). This was intentional to avoid positioning complexity.

5. **Tailwind v4:** Using Tailwind CSS 4, which has different config syntax than v3. Check official docs for breaking changes.

6. **CRXJS Plugin:** Handles manifest transformation and bundling. Don't manually edit `dist/manifest.json`.

7. **Shift Key Behavior:** Holding Shift while hovering selects parent element. This is by design for nested component selection.

## Git Workflow Notes

Current branch: `tailwind-converter` (working branch for Tailwind conversion features)

Recent feature additions:
- Intelligent color and spacing detection
- SVG attribute React compatibility
- Relative URL to absolute URL conversion
- Enhanced Tailwind property coverage
