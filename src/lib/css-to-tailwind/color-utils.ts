/**
 * Color parsing and Tailwind matching utilities
 */

import type { ParsedColor } from './types';
import { TAILWIND_COLORS, SPECIAL_COLORS, COLOR_MATCH_THRESHOLD } from './mappings';

/**
 * Parse a CSS color string into RGB(A) components
 */
export function parseColor(cssColor: string): ParsedColor | null {
  if (!cssColor || cssColor === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0, hex: 'transparent' };
  }

  const trimmed = cssColor.trim().toLowerCase();

  // Pattern 1: rgb(r, g, b) or rgb(r g b)
  const rgbMatch = trimmed.match(/^rgb\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*\)$/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return createColorResult(+r, +g, +b, 1);
  }

  // Pattern 2: rgba(r, g, b, a) with various formats
  const rgbaMatch = trimmed.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)[,\s/]+([0-9.]+%?)\s*\)$/);
  if (rgbaMatch) {
    const [, r, g, b, aStr] = rgbaMatch;
    let a = parseFloat(aStr);
    if (aStr.endsWith('%')) {
      a = a / 100;
    }
    return createColorResult(+r, +g, +b, a);
  }

  // Pattern 3: Modern rgb(r g b / a) syntax
  const modernRgbMatch = trimmed.match(/^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*([0-9.]+%?)\s*\)$/);
  if (modernRgbMatch) {
    const [, r, g, b, aStr] = modernRgbMatch;
    let a = parseFloat(aStr);
    if (aStr.endsWith('%')) {
      a = a / 100;
    }
    return createColorResult(+r, +g, +b, a);
  }

  // Pattern 4: hex (#rgb, #rrggbb, #rrggbbaa)
  const hexMatch = trimmed.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    return parseHex(hexMatch[1]);
  }

  // Pattern 5: Named colors (basic support)
  const namedColors: Record<string, [number, number, number]> = {
    'white': [255, 255, 255],
    'black': [0, 0, 0],
    'red': [255, 0, 0],
    'green': [0, 128, 0],
    'blue': [0, 0, 255],
    'yellow': [255, 255, 0],
    'cyan': [0, 255, 255],
    'magenta': [255, 0, 255],
    'gray': [128, 128, 128],
    'grey': [128, 128, 128],
  };

  if (namedColors[trimmed]) {
    const [r, g, b] = namedColors[trimmed];
    return createColorResult(r, g, b, 1);
  }

  return null;
}

/**
 * Parse hex color string
 */
function parseHex(hex: string): ParsedColor {
  let r: number, g: number, b: number, a = 1;

  if (hex.length === 3) {
    // #rgb
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 4) {
    // #rgba
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
    a = parseInt(hex[3] + hex[3], 16) / 255;
  } else if (hex.length === 6) {
    // #rrggbb
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else if (hex.length === 8) {
    // #rrggbbaa
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
    a = parseInt(hex.slice(6, 8), 16) / 255;
  } else {
    return { r: 0, g: 0, b: 0, a: 1, hex: '#000000' };
  }

  return createColorResult(r, g, b, a);
}

/**
 * Create a ParsedColor result
 */
function createColorResult(r: number, g: number, b: number, a: number): ParsedColor {
  const hex = a < 1
    ? `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(Math.round(a * 255))}`
    : `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  return { r, g, b, a, hex };
}

/**
 * Convert number to 2-digit hex
 */
function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

/**
 * Calculate Euclidean distance between two RGB colors
 */
function colorDistance(c1: [number, number, number], c2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  );
}

/**
 * Find the closest matching Tailwind color
 */
export function findClosestTailwindColor(color: ParsedColor): { name: string; distance: number } {
  let bestMatch = { name: '', distance: Infinity };

  // Check special colors first (exact matches)
  for (const [name, rgb] of Object.entries(SPECIAL_COLORS)) {
    if (name === 'transparent') continue;
    const distance = colorDistance([color.r, color.g, color.b], rgb as [number, number, number]);
    if (distance < bestMatch.distance) {
      bestMatch = { name, distance };
    }
  }

  // Check all Tailwind palette colors
  for (const [colorName, shades] of Object.entries(TAILWIND_COLORS)) {
    for (const [shade, rgb] of Object.entries(shades)) {
      const distance = colorDistance([color.r, color.g, color.b], rgb);
      if (distance < bestMatch.distance) {
        bestMatch = { name: `${colorName}-${shade}`, distance };
      }
    }
  }

  return bestMatch;
}

/**
 * Round opacity to nearest Tailwind opacity value (multiples of 5)
 */
function roundOpacity(opacity: number): number {
  return Math.round(opacity * 20) * 5; // Rounds to 0, 5, 10, 15, ... 95, 100
}

/**
 * Convert a CSS color to a Tailwind color class
 * @param cssColor - CSS color string (rgb, rgba, hex, etc.)
 * @param prefix - Tailwind prefix (text, bg, border, etc.)
 * @returns Tailwind class string or null if cannot convert
 */
export function convertColor(cssColor: string, prefix: 'text' | 'bg' | 'border' | 'fill' | 'stroke'): string | null {
  if (!cssColor) return null;

  // Handle transparent
  if (cssColor === 'transparent' || cssColor === 'rgba(0, 0, 0, 0)') {
    return `${prefix}-transparent`;
  }

  // Parse the color
  const parsed = parseColor(cssColor);
  if (!parsed) {
    // Fallback to arbitrary value
    return `${prefix}-[${cssColor}]`;
  }

  // Check for exact black/white first
  if (parsed.r === 0 && parsed.g === 0 && parsed.b === 0 && parsed.a === 1) {
    return `${prefix}-black`;
  }
  if (parsed.r === 255 && parsed.g === 255 && parsed.b === 255 && parsed.a === 1) {
    return `${prefix}-white`;
  }

  // Find closest Tailwind color
  const match = findClosestTailwindColor(parsed);

  if (match.distance <= COLOR_MATCH_THRESHOLD) {
    // Use the matched Tailwind color
    if (parsed.a < 1) {
      const opacityPercent = roundOpacity(parsed.a);
      if (opacityPercent === 0) {
        return `${prefix}-transparent`;
      }
      return `${prefix}-${match.name}/${opacityPercent}`;
    }
    return `${prefix}-${match.name}`;
  }

  // No close match - use arbitrary value
  if (parsed.a < 1) {
    // Use rgba for transparency
    return `${prefix}-[rgba(${parsed.r},${parsed.g},${parsed.b},${parsed.a.toFixed(2)})]`;
  }

  // Use hex for opaque colors
  return `${prefix}-[${parsed.hex}]`;
}

/**
 * Check if a color string is valid and parseable
 */
export function isValidColor(cssColor: string): boolean {
  return parseColor(cssColor) !== null;
}
