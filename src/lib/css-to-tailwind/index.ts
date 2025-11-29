/**
 * CSS to Tailwind Converter
 *
 * Usage:
 *   import { cssToTailwind } from '@/lib/css-to-tailwind';
 *
 *   const result = cssToTailwind({
 *     display: 'flex',
 *     alignItems: 'center',
 *     padding: '16px',
 *     backgroundColor: 'rgb(59, 130, 246)',
 *   });
 *
 *   console.log(result.className); // "flex items-center p-4 bg-blue-500"
 */

export { cssToTailwind } from './converter';
export { convertColor, parseColor, findClosestTailwindColor } from './color-utils';
export {
  convertSpacing,
  convertPadding,
  convertMargin,
  convertDimension,
  convertFontSize,
  convertLineHeight,
  convertBorderRadius,
  convertBorderWidth,
  convertOpacity,
  convertZIndex,
  convertGap,
  convertFlexBasis,
  convertInset,
  parseValue,
} from './value-utils';

export type { CSSProperties, ConversionResult, ParsedColor, ParsedValue, TestCase } from './types';
