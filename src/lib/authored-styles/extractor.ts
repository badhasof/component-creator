/**
 * Authored Styles Extractor
 *
 * Main entry point for extracting authored styles from elements.
 * Combines Tailwind detection with CSS rule lookup.
 */

import { extractTailwindClasses } from './tailwind-detector';
import { getStylesForClasses } from './css-parser';

export interface AuthoredStylesResult {
  /** Tailwind utility classes to preserve as className */
  tailwindClasses: string[];

  /** Custom CSS classes found on the element */
  customClasses: string[];

  /** Authored CSS properties from custom classes (to inline as style) */
  authoredStyles: Record<string, string>;

  /** Whether any custom classes had no authored styles found */
  hasMissingStyles: boolean;

  /** Classes where we couldn't find authored styles */
  missingStyleClasses: string[];
}

/**
 * Extract authored styles from an element
 *
 * @param element - The DOM element to extract styles from
 * @returns Structured result with Tailwind classes and authored styles
 */
export function extractAuthoredStyles(element: HTMLElement): AuthoredStylesResult {
  const className = element.getAttribute('class') || '';

  // Split into Tailwind and custom classes
  const { tailwindClasses, customClasses } = extractTailwindClasses(className);

  // Look up authored styles for custom classes
  const authoredStyles = getStylesForClasses(customClasses);

  // Track which classes had no styles found
  const missingStyleClasses: string[] = [];

  if (customClasses.length > 0 && Object.keys(authoredStyles).length === 0) {
    // None of the custom classes had authored styles
    missingStyleClasses.push(...customClasses);
  }

  return {
    tailwindClasses,
    customClasses,
    authoredStyles,
    hasMissingStyles: missingStyleClasses.length > 0,
    missingStyleClasses,
  };
}

/**
 * Convert authored styles to React style object format
 * Converts CSS property names (kebab-case) to React camelCase
 */
export function authoredStylesToReact(styles: Record<string, string>): Record<string, string> {
  const reactStyles: Record<string, string> = {};

  for (const [prop, value] of Object.entries(styles)) {
    // Convert kebab-case to camelCase
    const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    reactStyles[camelProp] = value;
  }

  return reactStyles;
}

/**
 * Merge authored styles with computed styles
 * Authored styles take precedence, computed styles fill gaps
 */
export function mergeWithComputedStyles(
  authoredStyles: Record<string, string>,
  computedStyles: Record<string, string>
): Record<string, string> {
  // Start with computed styles as base
  const merged = { ...computedStyles };

  // Overlay authored styles (they take precedence)
  for (const [prop, value] of Object.entries(authoredStyles)) {
    // Convert authored prop to camelCase if needed
    const camelProp = prop.includes('-')
      ? prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
      : prop;
    merged[camelProp] = value;
  }

  return merged;
}
