/**
 * Authored Styles Extraction
 *
 * This module extracts authored CSS styles from page stylesheets,
 * distinguishing between Tailwind utility classes and custom CSS classes.
 *
 * Strategy:
 * 1. Parse element's className into individual classes
 * 2. Detect Tailwind utility classes (preserve as-is)
 * 3. For non-Tailwind classes, look up authored CSS rules
 * 4. Return structured result with Tailwind classes + custom styles
 */

export {
  extractAuthoredStyles,
  authoredStylesToReact,
  mergeWithComputedStyles,
  type AuthoredStylesResult
} from './extractor';
export { isTailwindClass, extractTailwindClasses } from './tailwind-detector';
export { getStylesForClass, parsePageStylesheets, type ParsedStylesheet } from './css-parser';
