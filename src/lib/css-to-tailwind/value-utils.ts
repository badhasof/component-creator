/**
 * Value parsing utilities for spacing, dimensions, etc.
 */

import type { ParsedValue } from './types';
import {
  PX_TO_SPACING,
  FRACTIONAL_VALUES,
  DIMENSION_KEYWORDS,
  FONT_SIZE_SCALE,
  LINE_HEIGHT_PX,
  BORDER_RADIUS_SCALE,
  BORDER_WIDTH_SCALE,
  OPACITY_SCALE,
  Z_INDEX_SCALE,
} from './mappings';

/**
 * Parse a CSS value into number and unit
 */
export function parseValue(value: string): ParsedValue | null {
  if (!value) return null;

  const trimmed = value.trim();

  // Check for keywords first
  if (trimmed === 'auto' || trimmed === 'none' || trimmed === 'normal') {
    return { value: 0, unit: '', raw: trimmed };
  }

  // Pattern: number with optional unit
  const match = trimmed.match(/^(-?[\d.]+)(px|rem|em|%|vh|vw|vmin|vmax)?$/);
  if (match) {
    const [, numStr, unit = ''] = match;
    return {
      value: parseFloat(numStr),
      unit: unit as ParsedValue['unit'],
      raw: trimmed,
    };
  }

  return null;
}

/**
 * Convert a spacing value to Tailwind class
 * Uses exact matching only - arbitrary for non-standard values
 */
export function convertSpacing(
  value: string,
  prefix: 'p' | 'm' | 'gap' | 'space-x' | 'space-y' | 'pt' | 'pr' | 'pb' | 'pl' | 'px' | 'py' | 'mt' | 'mr' | 'mb' | 'ml' | 'mx' | 'my' | 'top' | 'right' | 'bottom' | 'left' | 'inset' | 'inset-x' | 'inset-y'
): string | null {
  if (!value) return null;

  const trimmed = value.trim();

  // Handle auto
  if (trimmed === 'auto') {
    return `${prefix}-auto`;
  }

  // Handle 0
  if (trimmed === '0' || trimmed === '0px') {
    return `${prefix}-0`;
  }

  const parsed = parseValue(trimmed);
  if (!parsed) {
    return `${prefix}-[${trimmed}]`;
  }

  // Convert rem to px for matching (1rem = 16px)
  let pxValue = parsed.value;
  if (parsed.unit === 'rem') {
    pxValue = parsed.value * 16;
  } else if (parsed.unit === 'em') {
    // em is context-dependent, use arbitrary
    return `${prefix}-[${trimmed}]`;
  } else if (parsed.unit === '%') {
    // Check fractional values
    const fraction = FRACTIONAL_VALUES[trimmed];
    if (fraction) {
      return `${prefix}-${fraction}`;
    }
    return `${prefix}-[${trimmed}]`;
  } else if (parsed.unit === 'vh' || parsed.unit === 'vw') {
    // Check dimension keywords
    const keyword = DIMENSION_KEYWORDS[trimmed];
    if (keyword) {
      return `${prefix}-${keyword}`;
    }
    return `${prefix}-[${trimmed}]`;
  }

  // Handle negative values
  const isNegative = pxValue < 0;
  const absValue = Math.abs(pxValue);

  // Check exact match in spacing scale
  const tailwindValue = PX_TO_SPACING.get(absValue);
  if (tailwindValue !== undefined) {
    return isNegative ? `-${prefix}-${tailwindValue}` : `${prefix}-${tailwindValue}`;
  }

  // No exact match - use arbitrary value
  const arbitraryValue = parsed.unit === 'rem' ? trimmed : `${parsed.value}px`;
  return isNegative
    ? `-${prefix}-[${arbitraryValue.replace('-', '')}]`
    : `${prefix}-[${arbitraryValue}]`;
}

/**
 * Convert padding shorthand to Tailwind classes
 * Handles 1, 2, 3, or 4 value patterns
 */
export function convertPadding(value: string): string[] {
  if (!value) return [];

  const parts = value.trim().split(/\s+/);

  if (parts.length === 1) {
    const cls = convertSpacing(parts[0], 'p');
    return cls ? [cls] : [];
  }

  if (parts.length === 2) {
    // [vertical, horizontal]
    const classes: string[] = [];
    const py = convertSpacing(parts[0], 'py');
    const px = convertSpacing(parts[1], 'px');
    if (py) classes.push(py);
    if (px) classes.push(px);
    return classes;
  }

  if (parts.length === 3) {
    // [top, horizontal, bottom]
    const classes: string[] = [];
    const pt = convertSpacing(parts[0], 'pt');
    const px = convertSpacing(parts[1], 'px');
    const pb = convertSpacing(parts[2], 'pb');
    if (pt) classes.push(pt);
    if (px) classes.push(px);
    if (pb) classes.push(pb);
    return classes;
  }

  if (parts.length === 4) {
    // [top, right, bottom, left]
    const classes: string[] = [];
    const pt = convertSpacing(parts[0], 'pt');
    const pr = convertSpacing(parts[1], 'pr');
    const pb = convertSpacing(parts[2], 'pb');
    const pl = convertSpacing(parts[3], 'pl');
    if (pt) classes.push(pt);
    if (pr) classes.push(pr);
    if (pb) classes.push(pb);
    if (pl) classes.push(pl);
    return classes;
  }

  return [`p-[${value}]`];
}

/**
 * Convert margin shorthand to Tailwind classes
 */
export function convertMargin(value: string): string[] {
  if (!value) return [];

  const parts = value.trim().split(/\s+/);

  if (parts.length === 1) {
    const cls = convertSpacing(parts[0], 'm');
    return cls ? [cls] : [];
  }

  if (parts.length === 2) {
    const classes: string[] = [];
    const my = convertSpacing(parts[0], 'my');
    const mx = convertSpacing(parts[1], 'mx');
    if (my) classes.push(my);
    if (mx) classes.push(mx);
    return classes;
  }

  if (parts.length === 3) {
    const classes: string[] = [];
    const mt = convertSpacing(parts[0], 'mt');
    const mx = convertSpacing(parts[1], 'mx');
    const mb = convertSpacing(parts[2], 'mb');
    if (mt) classes.push(mt);
    if (mx) classes.push(mx);
    if (mb) classes.push(mb);
    return classes;
  }

  if (parts.length === 4) {
    const classes: string[] = [];
    const mt = convertSpacing(parts[0], 'mt');
    const mr = convertSpacing(parts[1], 'mr');
    const mb = convertSpacing(parts[2], 'mb');
    const ml = convertSpacing(parts[3], 'ml');
    if (mt) classes.push(mt);
    if (mr) classes.push(mr);
    if (mb) classes.push(mb);
    if (ml) classes.push(ml);
    return classes;
  }

  return [`m-[${value}]`];
}

/**
 * Convert dimension (width/height) to Tailwind class
 */
export function convertDimension(
  value: string,
  prefix: 'w' | 'h' | 'min-w' | 'min-h' | 'max-w' | 'max-h' | 'size'
): string | null {
  if (!value) return null;

  const trimmed = value.trim();

  // Check keywords
  const keyword = DIMENSION_KEYWORDS[trimmed];
  if (keyword) {
    return `${prefix}-${keyword}`;
  }

  // Check fractional values
  const fraction = FRACTIONAL_VALUES[trimmed];
  if (fraction) {
    return `${prefix}-${fraction}`;
  }

  // Parse numeric value
  const parsed = parseValue(trimmed);
  if (!parsed) {
    return `${prefix}-[${trimmed}]`;
  }

  // Convert to px if rem
  let pxValue = parsed.value;
  if (parsed.unit === 'rem') {
    pxValue = parsed.value * 16;
  }

  // Check spacing scale for exact match
  if (parsed.unit === 'px' || parsed.unit === 'rem' || parsed.unit === '') {
    const tailwindValue = PX_TO_SPACING.get(pxValue);
    if (tailwindValue !== undefined) {
      return `${prefix}-${tailwindValue}`;
    }
  }

  // Use arbitrary value
  return `${prefix}-[${trimmed}]`;
}

/**
 * Convert font size to Tailwind class
 */
export function convertFontSize(value: string): string | null {
  if (!value) return null;

  const parsed = parseValue(value);
  if (!parsed) {
    return `text-[${value}]`;
  }

  // Convert to px
  let pxValue = parsed.value;
  if (parsed.unit === 'rem') {
    pxValue = parsed.value * 16;
  }

  // Check font size scale
  const match = FONT_SIZE_SCALE[pxValue];
  if (match) {
    return `text-${match[0]}`;
  }

  // Use arbitrary value
  return `text-[${value}]`;
}

/**
 * Convert line height to Tailwind class
 */
export function convertLineHeight(value: string): string | null {
  if (!value || value === 'normal') return null;

  const parsed = parseValue(value);
  if (!parsed) {
    return `leading-[${value}]`;
  }

  // Check if unitless (ratio)
  if (parsed.unit === '') {
    const ratioMap: Record<string, string> = {
      '1': 'leading-none',
      '1.25': 'leading-tight',
      '1.375': 'leading-snug',
      '1.5': 'leading-normal',
      '1.625': 'leading-relaxed',
      '2': 'leading-loose',
    };
    const match = ratioMap[parsed.value.toString()];
    if (match) return match;
  }

  // Check px values
  if (parsed.unit === 'px') {
    const pxMatch = LINE_HEIGHT_PX[parsed.value];
    if (pxMatch) return pxMatch;
  }

  return `leading-[${value}]`;
}

/**
 * Convert border radius to Tailwind class
 */
export function convertBorderRadius(value: string): string | null {
  if (!value || value === '0' || value === '0px') {
    return 'rounded-none';
  }

  const parsed = parseValue(value);
  if (!parsed) {
    return `rounded-[${value}]`;
  }

  let pxValue = parsed.value;
  if (parsed.unit === 'rem') {
    pxValue = parsed.value * 16;
  }

  // Check border radius scale
  const match = BORDER_RADIUS_SCALE[pxValue];
  if (match !== undefined) {
    return match;
  }

  // Special case for very large values (pill shape)
  if (pxValue >= 9999) {
    return 'rounded-full';
  }

  return `rounded-[${value}]`;
}

/**
 * Convert border width to Tailwind class
 */
export function convertBorderWidth(value: string): string | null {
  if (!value || value === '0' || value === '0px') {
    return 'border-0';
  }

  const parsed = parseValue(value);
  if (!parsed) {
    return `border-[${value}]`;
  }

  const pxValue = parsed.unit === 'rem' ? parsed.value * 16 : parsed.value;
  const match = BORDER_WIDTH_SCALE[pxValue];
  if (match !== undefined) {
    return match;
  }

  return `border-[${value}]`;
}

/**
 * Convert opacity to Tailwind class
 */
export function convertOpacity(value: string): string | null {
  if (!value || value === '1') return null;

  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    return `opacity-[${value}]`;
  }

  const percent = Math.round(parsed * 100);
  const match = OPACITY_SCALE[percent];
  if (match) {
    return match;
  }

  // Round to nearest 5
  const rounded = Math.round(percent / 5) * 5;
  const roundedMatch = OPACITY_SCALE[rounded];
  if (roundedMatch) {
    return roundedMatch;
  }

  return `opacity-[${value}]`;
}

/**
 * Convert z-index to Tailwind class
 */
export function convertZIndex(value: string): string | null {
  if (!value || value === 'auto') {
    return value === 'auto' ? 'z-auto' : null;
  }

  const match = Z_INDEX_SCALE[value];
  if (match) {
    return match;
  }

  return `z-[${value}]`;
}

/**
 * Convert gap to Tailwind class
 */
export function convertGap(value: string): string | null {
  if (!value || value === '0' || value === '0px' || value === 'normal') {
    return value === '0' || value === '0px' ? 'gap-0' : null;
  }

  return convertSpacing(value, 'gap');
}

/**
 * Convert flex basis to Tailwind class
 */
export function convertFlexBasis(value: string): string | null {
  if (!value || value === 'auto') {
    return value === 'auto' ? 'basis-auto' : null;
  }

  // Check fractional values
  const fraction = FRACTIONAL_VALUES[value];
  if (fraction) {
    return `basis-${fraction}`;
  }

  const parsed = parseValue(value);
  if (!parsed) {
    return `basis-[${value}]`;
  }

  // Check spacing scale
  let pxValue = parsed.value;
  if (parsed.unit === 'rem') {
    pxValue = parsed.value * 16;
  }

  const tailwindValue = PX_TO_SPACING.get(pxValue);
  if (tailwindValue !== undefined) {
    return `basis-${tailwindValue}`;
  }

  return `basis-[${value}]`;
}

/**
 * Convert inset (top/right/bottom/left) to Tailwind class
 */
export function convertInset(
  value: string,
  position: 'top' | 'right' | 'bottom' | 'left' | 'inset'
): string | null {
  if (!value || value === 'auto') {
    return value === 'auto' ? `${position}-auto` : null;
  }

  return convertSpacing(value, position);
}
