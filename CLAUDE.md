# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm install          # Install dependencies
npm run build        # Build extension to dist/ folder
npm run dev          # Development mode with hot reload
npm run lint         # Run ESLint
```

After building, load the `dist/` folder in Chrome via `chrome://extensions/` with Developer mode enabled.

## Architecture Overview

This is a Chrome Extension (Manifest V3) that allows users to inspect DOM elements and instantly generate React components from them - no AI required.

### Core Flow

1. **Activation**: User presses `Cmd+Shift+E` (Mac) or `Ctrl+Shift+E` (Windows)
2. **Selection Mode**: Hovering highlights elements with blue outline, tooltip shows element info
3. **Parent Selection**: Hold Shift to select parent container instead of hovered element
4. **Inspection**: Clicking an element opens a modal with style inspector
5. **Instant Conversion**: React component is generated instantly using algorithmic style extraction

### Key Components

- **`src/content.tsx`** - Main content script injected into all pages. Handles:
  - Selection mode toggle and event listeners (mouseover, mouseout, click)
  - Shift key detection for parent element selection
  - Modal rendering with React portal
  - Keyboard shortcuts (Cmd/Ctrl+Shift+E to toggle, ESC to close)

- **`src/background.ts`** - Service worker that listens for Chrome command API and broadcasts toggle message to all tabs

- **`src/components/StyleInspector.tsx`** - Modal component with 3 tabs:
  - **React**: Instantly converted React component with inline styles + live preview
  - **Styling**: Shows all computed CSS styles
  - **HTML**: Raw HTML output

- **`sandbox.html`** - Sandboxed page for live component preview. Loads React, ReactDOM, Babel, and Tailwind from vendor files, transforms JSX at runtime

### Style Extraction Algorithm

The `convertHtmlToReact` function in StyleInspector recursively processes elements and extracts:
- Colors (text, background)
- Typography (font-size, font-weight, font-family, line-height, letter-spacing)
- Layout (display, flex properties, gap)
- Spacing (padding, margin)
- Borders (width, style, color, radius)
- Dimensions (width, height, min-width, min-height)
- Position and overflow
- SVG-specific attributes (stroke, fill, stroke-width)

Default/browser values are filtered out to keep generated code clean.

### Build System

- Vite with `@crxjs/vite-plugin` handles Chrome extension bundling
- TypeScript compilation
- Vendor libraries (React, ReactDOM, Babel, Tailwind) bundled in `public/vendor/` for sandbox use
- Output goes to `dist/` folder with compiled manifest

### Chrome Extension Specifics

- All extension UI elements use `cc-` prefixed classes to avoid conflicts
- Z-index values use maximum (2147483646-2147483647) to overlay page content
- Content script avoids highlighting its own elements (modal, tooltip, backdrop)
- Sandbox iframe communicates via `postMessage` for secure code execution

### CSS-to-Tailwind Converter

Located in `src/lib/css-to-tailwind/`. Standalone module that converts CSS properties to Tailwind classes.

**Testing (iterate without rebuilding extension):**
```bash
npx tsx src/lib/css-to-tailwind/test-harness.ts              # Run all 71 tests
npx tsx src/lib/css-to-tailwind/test-harness.ts --custom '{"padding":"16px","backgroundColor":"rgb(59,130,246)"}'
```

**Key files:**
- `converter.ts` - Main `cssToTailwind()` function, handles 60+ CSS properties
- `mappings.ts` - Tailwind scale tables (colors, spacing, typography, etc.)
- `color-utils.ts` - RGB/hex parsing, palette matching (220 colors, distance threshold 15)
- `value-utils.ts` - Spacing/dimension parsing, shorthand decomposition
- `test-harness.ts` - CLI test runner (excluded from browser build via tsconfig)

**Conversion strategy:**
- Exact scale match → standard class (`16px` → `p-4`)
- No match → arbitrary value (`17px` → `p-[17px]`)
- Colors within distance 15 → palette match, otherwise arbitrary hex

**Integration:** `StyleInspector.tsx` has a Tailwind/Inline toggle. Set via `outputMode` state, defaults to `'tailwind'`.
