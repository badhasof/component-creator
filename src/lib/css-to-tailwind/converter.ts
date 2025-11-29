/**
 * Core CSS to Tailwind conversion logic
 */

import type { CSSProperties, ConversionResult } from './types';
import { convertColor } from './color-utils';
import {
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
} from './value-utils';
import {
  DISPLAY_MAP,
  FLEX_DIRECTION_MAP,
  FLEX_WRAP_MAP,
  JUSTIFY_CONTENT_MAP,
  ALIGN_ITEMS_MAP,
  ALIGN_SELF_MAP,
  POSITION_MAP,
  OVERFLOW_MAP,
  FONT_WEIGHT_MAP,
  LETTER_SPACING_MAP,
  TEXT_ALIGN_MAP,
  TEXT_TRANSFORM_MAP,
  WHITE_SPACE_MAP,
  TEXT_OVERFLOW_MAP,
  WORD_BREAK_MAP,
  CURSOR_MAP,
  POINTER_EVENTS_MAP,
  USER_SELECT_MAP,
  OBJECT_FIT_MAP,
  OBJECT_POSITION_MAP,
  ASPECT_RATIO_MAP,
  VISIBILITY_MAP,
  BORDER_STYLE_MAP,
  BACKGROUND_SIZE_MAP,
  BACKGROUND_POSITION_MAP,
  BACKGROUND_REPEAT_MAP,
  GRID_COLS_MAP,
  GRID_ROWS_MAP,
  GRID_AUTO_FLOW_MAP,
} from './mappings';

/**
 * Convert CSS properties to Tailwind classes
 */
export function cssToTailwind(css: CSSProperties): ConversionResult {
  const classes: string[] = [];
  const unconverted: string[] = [];

  // Helper to add a class or track unconverted
  const add = (result: string | null | string[], property: string) => {
    if (result === null) {
      unconverted.push(property);
    } else if (Array.isArray(result)) {
      classes.push(...result);
    } else if (result) {
      classes.push(result);
    }
  };

  // ==========================================================================
  // COLORS
  // ==========================================================================
  if (css.color) {
    add(convertColor(css.color, 'text'), 'color');
  }
  if (css.backgroundColor) {
    add(convertColor(css.backgroundColor, 'bg'), 'backgroundColor');
  }
  if (css.borderColor) {
    add(convertColor(css.borderColor, 'border'), 'borderColor');
  }

  // ==========================================================================
  // TYPOGRAPHY
  // ==========================================================================
  if (css.fontSize) {
    add(convertFontSize(css.fontSize), 'fontSize');
  }
  if (css.fontWeight) {
    const match = FONT_WEIGHT_MAP[css.fontWeight];
    add(match || `font-[${css.fontWeight}]`, 'fontWeight');
  }
  if (css.fontFamily) {
    // Try to match common font family patterns
    const family = css.fontFamily.toLowerCase();
    if (family.includes('mono') || family.includes('courier') || family.includes('consolas')) {
      add('font-mono', 'fontFamily');
    } else if (family.includes('serif') && !family.includes('sans')) {
      add('font-serif', 'fontFamily');
    } else if (family.includes('sans') || family.includes('arial') || family.includes('helvetica')) {
      add('font-sans', 'fontFamily');
    } else {
      // Extract first font name for arbitrary value
      const firstFont = css.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
      add(`font-['${firstFont}']`, 'fontFamily');
    }
  }
  if (css.lineHeight) {
    add(convertLineHeight(css.lineHeight), 'lineHeight');
  }
  if (css.letterSpacing) {
    const match = LETTER_SPACING_MAP[css.letterSpacing];
    add(match || `tracking-[${css.letterSpacing}]`, 'letterSpacing');
  }

  // ==========================================================================
  // LAYOUT
  // ==========================================================================
  if (css.display) {
    const match = DISPLAY_MAP[css.display];
    add(match || null, 'display');
  }
  if (css.flexDirection) {
    const match = FLEX_DIRECTION_MAP[css.flexDirection];
    add(match || null, 'flexDirection');
  }
  if (css.flexWrap) {
    const match = FLEX_WRAP_MAP[css.flexWrap];
    add(match || null, 'flexWrap');
  }
  if (css.justifyContent) {
    const match = JUSTIFY_CONTENT_MAP[css.justifyContent];
    add(match || null, 'justifyContent');
  }
  if (css.alignItems) {
    const match = ALIGN_ITEMS_MAP[css.alignItems];
    add(match || null, 'alignItems');
  }
  if (css.alignSelf) {
    const match = ALIGN_SELF_MAP[css.alignSelf];
    add(match || null, 'alignSelf');
  }
  if (css.gap) {
    add(convertGap(css.gap), 'gap');
  }

  // Flex item properties
  if (css.flexGrow && css.flexGrow !== '0') {
    add(css.flexGrow === '1' ? 'grow' : `grow-[${css.flexGrow}]`, 'flexGrow');
  }
  if (css.flexShrink && css.flexShrink !== '1') {
    add(css.flexShrink === '0' ? 'shrink-0' : `shrink-[${css.flexShrink}]`, 'flexShrink');
  }
  if (css.flexBasis) {
    add(convertFlexBasis(css.flexBasis), 'flexBasis');
  }
  if (css.order && css.order !== '0') {
    const orderMap: Record<string, string> = {
      '-9999': '-order-last',
      '9999': 'order-last',
      '-1': '-order-1',
      '1': 'order-1',
      '2': 'order-2',
      '3': 'order-3',
      '4': 'order-4',
      '5': 'order-5',
      '6': 'order-6',
      '7': 'order-7',
      '8': 'order-8',
      '9': 'order-9',
      '10': 'order-10',
      '11': 'order-11',
      '12': 'order-12',
    };
    add(orderMap[css.order] || `order-[${css.order}]`, 'order');
  }

  // ==========================================================================
  // SPACING
  // ==========================================================================
  if (css.padding) {
    add(convertPadding(css.padding), 'padding');
  }
  if (css.paddingTop) {
    add(convertSpacing(css.paddingTop, 'pt'), 'paddingTop');
  }
  if (css.paddingRight) {
    add(convertSpacing(css.paddingRight, 'pr'), 'paddingRight');
  }
  if (css.paddingBottom) {
    add(convertSpacing(css.paddingBottom, 'pb'), 'paddingBottom');
  }
  if (css.paddingLeft) {
    add(convertSpacing(css.paddingLeft, 'pl'), 'paddingLeft');
  }

  if (css.margin) {
    add(convertMargin(css.margin), 'margin');
  }
  if (css.marginTop) {
    add(convertSpacing(css.marginTop, 'mt'), 'marginTop');
  }
  if (css.marginRight) {
    add(convertSpacing(css.marginRight, 'mr'), 'marginRight');
  }
  if (css.marginBottom) {
    add(convertSpacing(css.marginBottom, 'mb'), 'marginBottom');
  }
  if (css.marginLeft) {
    add(convertSpacing(css.marginLeft, 'ml'), 'marginLeft');
  }

  // ==========================================================================
  // DIMENSIONS
  // ==========================================================================
  if (css.width) {
    add(convertDimension(css.width, 'w'), 'width');
  }
  if (css.height) {
    add(convertDimension(css.height, 'h'), 'height');
  }
  if (css.minWidth) {
    add(convertDimension(css.minWidth, 'min-w'), 'minWidth');
  }
  if (css.minHeight) {
    add(convertDimension(css.minHeight, 'min-h'), 'minHeight');
  }
  if (css.maxWidth) {
    add(convertDimension(css.maxWidth, 'max-w'), 'maxWidth');
  }
  if (css.maxHeight) {
    add(convertDimension(css.maxHeight, 'max-h'), 'maxHeight');
  }

  // ==========================================================================
  // BORDERS
  // ==========================================================================
  if (css.borderWidth) {
    add(convertBorderWidth(css.borderWidth), 'borderWidth');
  }
  if (css.borderStyle) {
    const match = BORDER_STYLE_MAP[css.borderStyle];
    add(match || null, 'borderStyle');
  }
  if (css.borderRadius) {
    add(convertBorderRadius(css.borderRadius), 'borderRadius');
  }

  // ==========================================================================
  // POSITION
  // ==========================================================================
  if (css.position) {
    const match = POSITION_MAP[css.position];
    add(match || null, 'position');
  }
  if (css.top) {
    add(convertInset(css.top, 'top'), 'top');
  }
  if (css.right) {
    add(convertInset(css.right, 'right'), 'right');
  }
  if (css.bottom) {
    add(convertInset(css.bottom, 'bottom'), 'bottom');
  }
  if (css.left) {
    add(convertInset(css.left, 'left'), 'left');
  }
  if (css.zIndex) {
    add(convertZIndex(css.zIndex), 'zIndex');
  }

  // ==========================================================================
  // GRID
  // ==========================================================================
  if (css.gridTemplateColumns) {
    const match = GRID_COLS_MAP[css.gridTemplateColumns];
    add(match || `grid-cols-[${css.gridTemplateColumns}]`, 'gridTemplateColumns');
  }
  if (css.gridTemplateRows) {
    const match = GRID_ROWS_MAP[css.gridTemplateRows];
    add(match || `grid-rows-[${css.gridTemplateRows}]`, 'gridTemplateRows');
  }
  if (css.gridColumn) {
    // Handle common patterns like "span 2 / span 2"
    const spanMatch = css.gridColumn.match(/^span\s+(\d+)\s*\/\s*span\s+\d+$/);
    if (spanMatch) {
      add(`col-span-${spanMatch[1]}`, 'gridColumn');
    } else if (css.gridColumn === 'auto') {
      add('col-auto', 'gridColumn');
    } else {
      add(`col-[${css.gridColumn}]`, 'gridColumn');
    }
  }
  if (css.gridRow) {
    const spanMatch = css.gridRow.match(/^span\s+(\d+)\s*\/\s*span\s+\d+$/);
    if (spanMatch) {
      add(`row-span-${spanMatch[1]}`, 'gridRow');
    } else if (css.gridRow === 'auto') {
      add('row-auto', 'gridRow');
    } else {
      add(`row-[${css.gridRow}]`, 'gridRow');
    }
  }
  if (css.gridAutoFlow) {
    const match = GRID_AUTO_FLOW_MAP[css.gridAutoFlow];
    add(match || null, 'gridAutoFlow');
  }

  // ==========================================================================
  // VISUAL EFFECTS
  // ==========================================================================
  if (css.opacity) {
    add(convertOpacity(css.opacity), 'opacity');
  }
  if (css.boxShadow && css.boxShadow !== 'none') {
    // Try to match common shadow patterns
    const shadowMap: Record<string, string> = {
      'rgba(0, 0, 0, 0) 0px 0px 0px 0px': 'shadow-none',
      'none': 'shadow-none',
    };
    const match = shadowMap[css.boxShadow];
    add(match || `shadow-[${css.boxShadow.replace(/\s+/g, '_')}]`, 'boxShadow');
  }
  if (css.transform && css.transform !== 'none') {
    // Parse common transform functions
    const transforms: string[] = [];

    // Rotate
    const rotateMatch = css.transform.match(/rotate\((-?[\d.]+)deg\)/);
    if (rotateMatch) {
      const deg = parseFloat(rotateMatch[1]);
      const presets = [0, 1, 2, 3, 6, 12, 45, 90, 180];
      if (presets.includes(Math.abs(deg))) {
        transforms.push(deg < 0 ? `-rotate-${Math.abs(deg)}` : `rotate-${deg}`);
      } else {
        transforms.push(`rotate-[${deg}deg]`);
      }
    }

    // Scale
    const scaleMatch = css.transform.match(/scale\(([\d.]+)(?:,\s*([\d.]+))?\)/);
    if (scaleMatch) {
      const scaleValue = parseFloat(scaleMatch[1]);
      const scaleMap: Record<number, string> = {
        0: 'scale-0',
        0.5: 'scale-50',
        0.75: 'scale-75',
        0.9: 'scale-90',
        0.95: 'scale-95',
        1: 'scale-100',
        1.05: 'scale-105',
        1.1: 'scale-110',
        1.25: 'scale-125',
        1.5: 'scale-150',
      };
      transforms.push(scaleMap[scaleValue] || `scale-[${scaleValue}]`);
    }

    // TranslateX/Y
    const translateXMatch = css.transform.match(/translateX\(([^)]+)\)/);
    if (translateXMatch) {
      transforms.push(`translate-x-[${translateXMatch[1]}]`);
    }
    const translateYMatch = css.transform.match(/translateY\(([^)]+)\)/);
    if (translateYMatch) {
      transforms.push(`translate-y-[${translateYMatch[1]}]`);
    }

    if (transforms.length > 0) {
      add(transforms, 'transform');
    } else {
      // Fallback for complex transforms
      add(`[transform:${css.transform}]`, 'transform');
    }
  }

  // Background
  if (css.backgroundImage && css.backgroundImage !== 'none') {
    // Handle gradients and images
    if (css.backgroundImage.includes('linear-gradient')) {
      add(`bg-[${css.backgroundImage}]`, 'backgroundImage');
    } else if (css.backgroundImage.includes('url(')) {
      add(`bg-[${css.backgroundImage}]`, 'backgroundImage');
    }
  }
  if (css.backgroundSize) {
    const match = BACKGROUND_SIZE_MAP[css.backgroundSize];
    add(match || `bg-[size:${css.backgroundSize}]`, 'backgroundSize');
  }
  if (css.backgroundPosition) {
    const match = BACKGROUND_POSITION_MAP[css.backgroundPosition];
    add(match || `bg-[position:${css.backgroundPosition}]`, 'backgroundPosition');
  }
  if (css.backgroundRepeat) {
    const match = BACKGROUND_REPEAT_MAP[css.backgroundRepeat];
    add(match || null, 'backgroundRepeat');
  }

  // ==========================================================================
  // TEXT STYLING
  // ==========================================================================
  if (css.textAlign) {
    const match = TEXT_ALIGN_MAP[css.textAlign];
    add(match || null, 'textAlign');
  }
  if (css.textTransform) {
    const match = TEXT_TRANSFORM_MAP[css.textTransform];
    add(match || null, 'textTransform');
  }
  if (css.textDecoration || css.textDecorationLine) {
    const value = css.textDecorationLine || css.textDecoration || '';
    // Handle compound values like "underline solid rgb(...)"
    if (value.includes('underline')) {
      add('underline', 'textDecoration');
    } else if (value.includes('line-through')) {
      add('line-through', 'textDecoration');
    } else if (value.includes('overline')) {
      add('overline', 'textDecoration');
    } else if (value === 'none' || value.startsWith('none')) {
      add('no-underline', 'textDecoration');
    }
  }
  if (css.whiteSpace) {
    const match = WHITE_SPACE_MAP[css.whiteSpace];
    add(match || null, 'whiteSpace');
  }
  if (css.textOverflow) {
    const match = TEXT_OVERFLOW_MAP[css.textOverflow];
    add(match || null, 'textOverflow');
  }
  if (css.wordBreak) {
    const match = WORD_BREAK_MAP[css.wordBreak];
    add(match || null, 'wordBreak');
  }
  if (css.textShadow && css.textShadow !== 'none') {
    add(`[text-shadow:${css.textShadow}]`, 'textShadow');
  }

  // ==========================================================================
  // OVERFLOW
  // ==========================================================================
  if (css.overflow) {
    const match = OVERFLOW_MAP[css.overflow];
    if (match) {
      add(`overflow-${match}`, 'overflow');
    }
  }
  if (css.overflowX && css.overflowX !== css.overflow) {
    const match = OVERFLOW_MAP[css.overflowX];
    if (match) {
      add(`overflow-x-${match}`, 'overflowX');
    }
  }
  if (css.overflowY && css.overflowY !== css.overflow) {
    const match = OVERFLOW_MAP[css.overflowY];
    if (match) {
      add(`overflow-y-${match}`, 'overflowY');
    }
  }

  // ==========================================================================
  // INTERACTIVITY
  // ==========================================================================
  if (css.cursor) {
    const match = CURSOR_MAP[css.cursor];
    add(match || `cursor-[${css.cursor}]`, 'cursor');
  }
  if (css.pointerEvents) {
    const match = POINTER_EVENTS_MAP[css.pointerEvents];
    add(match || null, 'pointerEvents');
  }
  if (css.userSelect) {
    const match = USER_SELECT_MAP[css.userSelect];
    add(match || null, 'userSelect');
  }

  // ==========================================================================
  // OTHER
  // ==========================================================================
  if (css.visibility) {
    const match = VISIBILITY_MAP[css.visibility];
    add(match || null, 'visibility');
  }
  if (css.aspectRatio) {
    const match = ASPECT_RATIO_MAP[css.aspectRatio];
    add(match || `aspect-[${css.aspectRatio.replace(/\s+/g, '')}]`, 'aspectRatio');
  }
  if (css.objectFit) {
    const match = OBJECT_FIT_MAP[css.objectFit];
    add(match || null, 'objectFit');
  }
  if (css.objectPosition) {
    const match = OBJECT_POSITION_MAP[css.objectPosition];
    add(match || `object-[${css.objectPosition}]`, 'objectPosition');
  }
  if (css.outline && css.outline !== 'none') {
    // Handle outline as arbitrary
    add(`outline-[${css.outline}]`, 'outline');
  }

  // ==========================================================================
  // SVG
  // ==========================================================================
  if (css.fill) {
    add(convertColor(css.fill, 'fill'), 'fill');
  }
  if (css.stroke) {
    add(convertColor(css.stroke, 'stroke'), 'stroke');
  }
  if (css.strokeWidth) {
    const widthMap: Record<string, string> = {
      '0': 'stroke-0',
      '1': 'stroke-1',
      '2': 'stroke-2',
    };
    add(widthMap[css.strokeWidth] || `stroke-[${css.strokeWidth}]`, 'strokeWidth');
  }

  // Escape spaces in arbitrary values (Tailwind requires underscores inside [...])
  const sanitizedClasses = classes.map(c =>
    c.replace(/\[([^\]]+)\]/g, (_, v) => `[${v.replace(/\s+/g, '_')}]`)
  );

  const arbitraryCount = sanitizedClasses.filter(c => c.includes('[')).length;

  return {
    classes: sanitizedClasses,
    className: sanitizedClasses.join(' '),
    unconverted,
    arbitraryCount,
  };
}
