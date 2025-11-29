/**
 * Tailwind CSS Mapping Tables
 * Complete mappings for CSS to Tailwind conversion
 */

// =============================================================================
// COLOR PALETTE (Full Tailwind v3/v4 palette)
// RGB values for color matching
// =============================================================================

export const TAILWIND_COLORS: Record<string, Record<string, [number, number, number]>> = {
  slate: {
    '50': [248, 250, 252],
    '100': [241, 245, 249],
    '200': [226, 232, 240],
    '300': [203, 213, 225],
    '400': [148, 163, 184],
    '500': [100, 116, 139],
    '600': [71, 85, 105],
    '700': [51, 65, 85],
    '800': [30, 41, 59],
    '900': [15, 23, 42],
    '950': [2, 6, 23],
  },
  gray: {
    '50': [249, 250, 251],
    '100': [243, 244, 246],
    '200': [229, 231, 235],
    '300': [209, 213, 219],
    '400': [156, 163, 175],
    '500': [107, 114, 128],
    '600': [75, 85, 99],
    '700': [55, 65, 81],
    '800': [31, 41, 55],
    '900': [17, 24, 39],
    '950': [3, 7, 18],
  },
  zinc: {
    '50': [250, 250, 250],
    '100': [244, 244, 245],
    '200': [228, 228, 231],
    '300': [212, 212, 216],
    '400': [161, 161, 170],
    '500': [113, 113, 122],
    '600': [82, 82, 91],
    '700': [63, 63, 70],
    '800': [39, 39, 42],
    '900': [24, 24, 27],
    '950': [9, 9, 11],
  },
  neutral: {
    '50': [250, 250, 250],
    '100': [245, 245, 245],
    '200': [229, 229, 229],
    '300': [212, 212, 212],
    '400': [163, 163, 163],
    '500': [115, 115, 115],
    '600': [82, 82, 82],
    '700': [64, 64, 64],
    '800': [38, 38, 38],
    '900': [23, 23, 23],
    '950': [10, 10, 10],
  },
  stone: {
    '50': [250, 250, 249],
    '100': [245, 245, 244],
    '200': [231, 229, 228],
    '300': [214, 211, 209],
    '400': [168, 162, 158],
    '500': [120, 113, 108],
    '600': [87, 83, 78],
    '700': [68, 64, 60],
    '800': [41, 37, 36],
    '900': [28, 25, 23],
    '950': [12, 10, 9],
  },
  red: {
    '50': [254, 242, 242],
    '100': [254, 226, 226],
    '200': [254, 202, 202],
    '300': [252, 165, 165],
    '400': [248, 113, 113],
    '500': [239, 68, 68],
    '600': [220, 38, 38],
    '700': [185, 28, 28],
    '800': [153, 27, 27],
    '900': [127, 29, 29],
    '950': [69, 10, 10],
  },
  orange: {
    '50': [255, 247, 237],
    '100': [255, 237, 213],
    '200': [254, 215, 170],
    '300': [253, 186, 116],
    '400': [251, 146, 60],
    '500': [249, 115, 22],
    '600': [234, 88, 12],
    '700': [194, 65, 12],
    '800': [154, 52, 18],
    '900': [124, 45, 18],
    '950': [67, 20, 7],
  },
  amber: {
    '50': [255, 251, 235],
    '100': [254, 243, 199],
    '200': [253, 230, 138],
    '300': [252, 211, 77],
    '400': [251, 191, 36],
    '500': [245, 158, 11],
    '600': [217, 119, 6],
    '700': [180, 83, 9],
    '800': [146, 64, 14],
    '900': [120, 53, 15],
    '950': [69, 26, 3],
  },
  yellow: {
    '50': [254, 252, 232],
    '100': [254, 249, 195],
    '200': [254, 240, 138],
    '300': [253, 224, 71],
    '400': [250, 204, 21],
    '500': [234, 179, 8],
    '600': [202, 138, 4],
    '700': [161, 98, 7],
    '800': [133, 77, 14],
    '900': [113, 63, 18],
    '950': [66, 32, 6],
  },
  lime: {
    '50': [247, 254, 231],
    '100': [236, 252, 203],
    '200': [217, 249, 157],
    '300': [190, 242, 100],
    '400': [163, 230, 53],
    '500': [132, 204, 22],
    '600': [101, 163, 13],
    '700': [77, 124, 15],
    '800': [63, 98, 18],
    '900': [54, 83, 20],
    '950': [26, 46, 5],
  },
  green: {
    '50': [240, 253, 244],
    '100': [220, 252, 231],
    '200': [187, 247, 208],
    '300': [134, 239, 172],
    '400': [74, 222, 128],
    '500': [34, 197, 94],
    '600': [22, 163, 74],
    '700': [21, 128, 61],
    '800': [22, 101, 52],
    '900': [20, 83, 45],
    '950': [5, 46, 22],
  },
  emerald: {
    '50': [236, 253, 245],
    '100': [209, 250, 229],
    '200': [167, 243, 208],
    '300': [110, 231, 183],
    '400': [52, 211, 153],
    '500': [16, 185, 129],
    '600': [5, 150, 105],
    '700': [4, 120, 87],
    '800': [6, 95, 70],
    '900': [6, 78, 59],
    '950': [2, 44, 34],
  },
  teal: {
    '50': [240, 253, 250],
    '100': [204, 251, 241],
    '200': [153, 246, 228],
    '300': [94, 234, 212],
    '400': [45, 212, 191],
    '500': [20, 184, 166],
    '600': [13, 148, 136],
    '700': [15, 118, 110],
    '800': [17, 94, 89],
    '900': [19, 78, 74],
    '950': [4, 47, 46],
  },
  cyan: {
    '50': [236, 254, 255],
    '100': [207, 250, 254],
    '200': [165, 243, 252],
    '300': [103, 232, 249],
    '400': [34, 211, 238],
    '500': [6, 182, 212],
    '600': [8, 145, 178],
    '700': [14, 116, 144],
    '800': [21, 94, 117],
    '900': [22, 78, 99],
    '950': [8, 51, 68],
  },
  sky: {
    '50': [240, 249, 255],
    '100': [224, 242, 254],
    '200': [186, 230, 253],
    '300': [125, 211, 252],
    '400': [56, 189, 248],
    '500': [14, 165, 233],
    '600': [2, 132, 199],
    '700': [3, 105, 161],
    '800': [7, 89, 133],
    '900': [12, 74, 110],
    '950': [8, 47, 73],
  },
  blue: {
    '50': [239, 246, 255],
    '100': [219, 234, 254],
    '200': [191, 219, 254],
    '300': [147, 197, 253],
    '400': [96, 165, 250],
    '500': [59, 130, 246],
    '600': [37, 99, 235],
    '700': [29, 78, 216],
    '800': [30, 64, 175],
    '900': [30, 58, 138],
    '950': [23, 37, 84],
  },
  indigo: {
    '50': [238, 242, 255],
    '100': [224, 231, 255],
    '200': [199, 210, 254],
    '300': [165, 180, 252],
    '400': [129, 140, 248],
    '500': [99, 102, 241],
    '600': [79, 70, 229],
    '700': [67, 56, 202],
    '800': [55, 48, 163],
    '900': [49, 46, 129],
    '950': [30, 27, 75],
  },
  violet: {
    '50': [245, 243, 255],
    '100': [237, 233, 254],
    '200': [221, 214, 254],
    '300': [196, 181, 253],
    '400': [167, 139, 250],
    '500': [139, 92, 246],
    '600': [124, 58, 237],
    '700': [109, 40, 217],
    '800': [91, 33, 182],
    '900': [76, 29, 149],
    '950': [46, 16, 101],
  },
  purple: {
    '50': [250, 245, 255],
    '100': [243, 232, 255],
    '200': [233, 213, 255],
    '300': [216, 180, 254],
    '400': [192, 132, 252],
    '500': [168, 85, 247],
    '600': [147, 51, 234],
    '700': [126, 34, 206],
    '800': [107, 33, 168],
    '900': [88, 28, 135],
    '950': [59, 7, 100],
  },
  fuchsia: {
    '50': [253, 244, 255],
    '100': [250, 232, 255],
    '200': [245, 208, 254],
    '300': [240, 171, 252],
    '400': [232, 121, 249],
    '500': [217, 70, 239],
    '600': [192, 38, 211],
    '700': [162, 28, 175],
    '800': [134, 25, 143],
    '900': [112, 26, 117],
    '950': [74, 4, 78],
  },
  pink: {
    '50': [253, 242, 248],
    '100': [252, 231, 243],
    '200': [251, 207, 232],
    '300': [249, 168, 212],
    '400': [244, 114, 182],
    '500': [236, 72, 153],
    '600': [219, 39, 119],
    '700': [190, 24, 93],
    '800': [157, 23, 77],
    '900': [131, 24, 67],
    '950': [80, 7, 36],
  },
  rose: {
    '50': [255, 241, 242],
    '100': [255, 228, 230],
    '200': [254, 205, 211],
    '300': [253, 164, 175],
    '400': [251, 113, 133],
    '500': [244, 63, 94],
    '600': [225, 29, 72],
    '700': [190, 18, 60],
    '800': [159, 18, 57],
    '900': [136, 19, 55],
    '950': [76, 5, 25],
  },
};

// Special colors
export const SPECIAL_COLORS: Record<string, [number, number, number, number?]> = {
  'white': [255, 255, 255],
  'black': [0, 0, 0],
  'transparent': [0, 0, 0, 0],
};

// Color distance threshold for matching
export const COLOR_MATCH_THRESHOLD = 15;

// =============================================================================
// SPACING SCALE
// Tailwind spacing: value * 0.25rem = value * 4px (at default 16px root)
// =============================================================================

export const SPACING_SCALE: Record<string, number> = {
  '0': 0,
  'px': 1,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '11': 44,
  '12': 48,
  '14': 56,
  '16': 64,
  '20': 80,
  '24': 96,
  '28': 112,
  '32': 128,
  '36': 144,
  '40': 160,
  '44': 176,
  '48': 192,
  '52': 208,
  '56': 224,
  '60': 240,
  '64': 256,
  '72': 288,
  '80': 320,
  '96': 384,
};

// Reverse lookup (px -> Tailwind value)
export const PX_TO_SPACING = new Map<number, string>(
  Object.entries(SPACING_SCALE).map(([k, v]) => [v, k])
);

// Fractional values for width/height
export const FRACTIONAL_VALUES: Record<string, string> = {
  '50%': '1/2',
  '33.333333%': '1/3',
  '33.3333%': '1/3',
  '66.666667%': '2/3',
  '66.6667%': '2/3',
  '25%': '1/4',
  '75%': '3/4',
  '20%': '1/5',
  '40%': '2/5',
  '60%': '3/5',
  '80%': '4/5',
  '16.666667%': '1/6',
  '83.333333%': '5/6',
  '8.333333%': '1/12',
  '100%': 'full',
};

// Special dimension keywords
export const DIMENSION_KEYWORDS: Record<string, string> = {
  'auto': 'auto',
  'min-content': 'min',
  'max-content': 'max',
  'fit-content': 'fit',
  '100vw': 'screen',
  '100vh': 'screen',
  '100%': 'full',
  '100dvh': 'dvh',
  '100svh': 'svh',
  '100lvh': 'lvh',
};

// =============================================================================
// TYPOGRAPHY
// =============================================================================

// Font size: [fontSize in px, default lineHeight in px]
export const FONT_SIZE_SCALE: Record<number, [string, number?]> = {
  12: ['xs', 16],
  14: ['sm', 20],
  16: ['base', 24],
  18: ['lg', 28],
  20: ['xl', 28],
  24: ['2xl', 32],
  30: ['3xl', 36],
  36: ['4xl', 40],
  48: ['5xl', 48],
  60: ['6xl', 60],
  72: ['7xl', 72],
  96: ['8xl', 96],
  128: ['9xl', 128],
};

// Font weight
export const FONT_WEIGHT_MAP: Record<string, string> = {
  '100': 'font-thin',
  '200': 'font-extralight',
  '300': 'font-light',
  '400': 'font-normal',
  '500': 'font-medium',
  '600': 'font-semibold',
  '700': 'font-bold',
  '800': 'font-extrabold',
  '900': 'font-black',
};

// Line height (unitless values)
export const LINE_HEIGHT_MAP: Record<string, string> = {
  '1': 'leading-none',
  '1.25': 'leading-tight',
  '1.375': 'leading-snug',
  '1.5': 'leading-normal',
  '1.625': 'leading-relaxed',
  '2': 'leading-loose',
};

// Line height px values
export const LINE_HEIGHT_PX: Record<number, string> = {
  12: 'leading-3',
  16: 'leading-4',
  20: 'leading-5',
  24: 'leading-6',
  28: 'leading-7',
  32: 'leading-8',
  36: 'leading-9',
  40: 'leading-10',
};

// Letter spacing
export const LETTER_SPACING_MAP: Record<string, string> = {
  '-0.05em': 'tracking-tighter',
  '-0.025em': 'tracking-tight',
  '0em': 'tracking-normal',
  '0': 'tracking-normal',
  '0px': 'tracking-normal',
  '0.025em': 'tracking-wide',
  '0.05em': 'tracking-wider',
  '0.1em': 'tracking-widest',
};

// Font family keywords
export const FONT_FAMILY_MAP: Record<string, string> = {
  'sans-serif': 'font-sans',
  'serif': 'font-serif',
  'monospace': 'font-mono',
  'ui-sans-serif': 'font-sans',
  'ui-serif': 'font-serif',
  'ui-monospace': 'font-mono',
};

// =============================================================================
// LAYOUT
// =============================================================================

export const DISPLAY_MAP: Record<string, string> = {
  'block': 'block',
  'inline-block': 'inline-block',
  'inline': 'inline',
  'flex': 'flex',
  'inline-flex': 'inline-flex',
  'grid': 'grid',
  'inline-grid': 'inline-grid',
  'contents': 'contents',
  'flow-root': 'flow-root',
  'list-item': 'list-item',
  'none': 'hidden',
  'table': 'table',
  'table-caption': 'table-caption',
  'table-cell': 'table-cell',
  'table-column': 'table-column',
  'table-column-group': 'table-column-group',
  'table-footer-group': 'table-footer-group',
  'table-header-group': 'table-header-group',
  'table-row-group': 'table-row-group',
  'table-row': 'table-row',
};

export const FLEX_DIRECTION_MAP: Record<string, string> = {
  'row': 'flex-row',
  'row-reverse': 'flex-row-reverse',
  'column': 'flex-col',
  'column-reverse': 'flex-col-reverse',
};

export const FLEX_WRAP_MAP: Record<string, string> = {
  'wrap': 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
  'nowrap': 'flex-nowrap',
};

export const JUSTIFY_CONTENT_MAP: Record<string, string> = {
  'flex-start': 'justify-start',
  'flex-end': 'justify-end',
  'center': 'justify-center',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
  'stretch': 'justify-stretch',
  'start': 'justify-start',
  'end': 'justify-end',
  'normal': 'justify-normal',
};

export const ALIGN_ITEMS_MAP: Record<string, string> = {
  'flex-start': 'items-start',
  'flex-end': 'items-end',
  'center': 'items-center',
  'baseline': 'items-baseline',
  'stretch': 'items-stretch',
  'start': 'items-start',
  'end': 'items-end',
};

export const ALIGN_SELF_MAP: Record<string, string> = {
  'auto': 'self-auto',
  'flex-start': 'self-start',
  'flex-end': 'self-end',
  'center': 'self-center',
  'baseline': 'self-baseline',
  'stretch': 'self-stretch',
  'start': 'self-start',
  'end': 'self-end',
};

export const ALIGN_CONTENT_MAP: Record<string, string> = {
  'flex-start': 'content-start',
  'flex-end': 'content-end',
  'center': 'content-center',
  'space-between': 'content-between',
  'space-around': 'content-around',
  'space-evenly': 'content-evenly',
  'stretch': 'content-stretch',
  'start': 'content-start',
  'end': 'content-end',
  'baseline': 'content-baseline',
  'normal': 'content-normal',
};

export const POSITION_MAP: Record<string, string> = {
  'static': 'static',
  'fixed': 'fixed',
  'absolute': 'absolute',
  'relative': 'relative',
  'sticky': 'sticky',
};

export const OVERFLOW_MAP: Record<string, string> = {
  'auto': 'auto',
  'hidden': 'hidden',
  'clip': 'clip',
  'visible': 'visible',
  'scroll': 'scroll',
};

// =============================================================================
// BORDERS
// =============================================================================

export const BORDER_WIDTH_SCALE: Record<number, string> = {
  0: 'border-0',
  1: 'border',
  2: 'border-2',
  4: 'border-4',
  8: 'border-8',
};

export const BORDER_RADIUS_SCALE: Record<number, string> = {
  0: 'rounded-none',
  2: 'rounded-sm',
  4: 'rounded',
  6: 'rounded-md',
  8: 'rounded-lg',
  12: 'rounded-xl',
  16: 'rounded-2xl',
  24: 'rounded-3xl',
  9999: 'rounded-full',
};

export const BORDER_STYLE_MAP: Record<string, string> = {
  'solid': 'border-solid',
  'dashed': 'border-dashed',
  'dotted': 'border-dotted',
  'double': 'border-double',
  'hidden': 'border-hidden',
  'none': 'border-none',
};

// =============================================================================
// EFFECTS
// =============================================================================

// Opacity scale (percentage to Tailwind class)
export const OPACITY_SCALE: Record<number, string> = {
  0: 'opacity-0',
  5: 'opacity-5',
  10: 'opacity-10',
  15: 'opacity-15',
  20: 'opacity-20',
  25: 'opacity-25',
  30: 'opacity-30',
  35: 'opacity-35',
  40: 'opacity-40',
  45: 'opacity-45',
  50: 'opacity-50',
  55: 'opacity-55',
  60: 'opacity-60',
  65: 'opacity-65',
  70: 'opacity-70',
  75: 'opacity-75',
  80: 'opacity-80',
  85: 'opacity-85',
  90: 'opacity-90',
  95: 'opacity-95',
  100: 'opacity-100',
};

// Z-index scale
export const Z_INDEX_SCALE: Record<string, string> = {
  '0': 'z-0',
  '10': 'z-10',
  '20': 'z-20',
  '30': 'z-30',
  '40': 'z-40',
  '50': 'z-50',
  'auto': 'z-auto',
};

// =============================================================================
// TEXT STYLING
// =============================================================================

export const TEXT_ALIGN_MAP: Record<string, string> = {
  'left': 'text-left',
  'center': 'text-center',
  'right': 'text-right',
  'justify': 'text-justify',
  'start': 'text-start',
  'end': 'text-end',
};

export const TEXT_TRANSFORM_MAP: Record<string, string> = {
  'uppercase': 'uppercase',
  'lowercase': 'lowercase',
  'capitalize': 'capitalize',
  'none': 'normal-case',
};

export const TEXT_DECORATION_MAP: Record<string, string> = {
  'underline': 'underline',
  'overline': 'overline',
  'line-through': 'line-through',
  'none': 'no-underline',
};

export const WHITE_SPACE_MAP: Record<string, string> = {
  'normal': 'whitespace-normal',
  'nowrap': 'whitespace-nowrap',
  'pre': 'whitespace-pre',
  'pre-line': 'whitespace-pre-line',
  'pre-wrap': 'whitespace-pre-wrap',
  'break-spaces': 'whitespace-break-spaces',
};

export const TEXT_OVERFLOW_MAP: Record<string, string> = {
  'ellipsis': 'text-ellipsis',
  'clip': 'text-clip',
};

export const WORD_BREAK_MAP: Record<string, string> = {
  'normal': 'break-normal',
  'break-all': 'break-all',
  'keep-all': 'break-keep',
};

// =============================================================================
// INTERACTIVITY
// =============================================================================

export const CURSOR_MAP: Record<string, string> = {
  'auto': 'cursor-auto',
  'default': 'cursor-default',
  'pointer': 'cursor-pointer',
  'wait': 'cursor-wait',
  'text': 'cursor-text',
  'move': 'cursor-move',
  'help': 'cursor-help',
  'not-allowed': 'cursor-not-allowed',
  'none': 'cursor-none',
  'context-menu': 'cursor-context-menu',
  'progress': 'cursor-progress',
  'cell': 'cursor-cell',
  'crosshair': 'cursor-crosshair',
  'vertical-text': 'cursor-vertical-text',
  'alias': 'cursor-alias',
  'copy': 'cursor-copy',
  'no-drop': 'cursor-no-drop',
  'grab': 'cursor-grab',
  'grabbing': 'cursor-grabbing',
  'all-scroll': 'cursor-all-scroll',
  'col-resize': 'cursor-col-resize',
  'row-resize': 'cursor-row-resize',
  'n-resize': 'cursor-n-resize',
  'e-resize': 'cursor-e-resize',
  's-resize': 'cursor-s-resize',
  'w-resize': 'cursor-w-resize',
  'ne-resize': 'cursor-ne-resize',
  'nw-resize': 'cursor-nw-resize',
  'se-resize': 'cursor-se-resize',
  'sw-resize': 'cursor-sw-resize',
  'ew-resize': 'cursor-ew-resize',
  'ns-resize': 'cursor-ns-resize',
  'nesw-resize': 'cursor-nesw-resize',
  'nwse-resize': 'cursor-nwse-resize',
  'zoom-in': 'cursor-zoom-in',
  'zoom-out': 'cursor-zoom-out',
};

export const POINTER_EVENTS_MAP: Record<string, string> = {
  'none': 'pointer-events-none',
  'auto': 'pointer-events-auto',
};

export const USER_SELECT_MAP: Record<string, string> = {
  'none': 'select-none',
  'text': 'select-text',
  'all': 'select-all',
  'auto': 'select-auto',
};

// =============================================================================
// OTHER
// =============================================================================

export const OBJECT_FIT_MAP: Record<string, string> = {
  'contain': 'object-contain',
  'cover': 'object-cover',
  'fill': 'object-fill',
  'none': 'object-none',
  'scale-down': 'object-scale-down',
};

export const OBJECT_POSITION_MAP: Record<string, string> = {
  'bottom': 'object-bottom',
  'center': 'object-center',
  'left': 'object-left',
  'left bottom': 'object-left-bottom',
  'left top': 'object-left-top',
  'right': 'object-right',
  'right bottom': 'object-right-bottom',
  'right top': 'object-right-top',
  'top': 'object-top',
};

export const ASPECT_RATIO_MAP: Record<string, string> = {
  'auto': 'aspect-auto',
  '1 / 1': 'aspect-square',
  '1/1': 'aspect-square',
  '16 / 9': 'aspect-video',
  '16/9': 'aspect-video',
  '4 / 3': 'aspect-[4/3]',
  '4/3': 'aspect-[4/3]',
};

export const VISIBILITY_MAP: Record<string, string> = {
  'visible': 'visible',
  'hidden': 'invisible',
  'collapse': 'collapse',
};

// Background size
export const BACKGROUND_SIZE_MAP: Record<string, string> = {
  'auto': 'bg-auto',
  'cover': 'bg-cover',
  'contain': 'bg-contain',
};

// Background position
export const BACKGROUND_POSITION_MAP: Record<string, string> = {
  'bottom': 'bg-bottom',
  'center': 'bg-center',
  'left': 'bg-left',
  'left bottom': 'bg-left-bottom',
  'left top': 'bg-left-top',
  'right': 'bg-right',
  'right bottom': 'bg-right-bottom',
  'right top': 'bg-right-top',
  'top': 'bg-top',
  '50% 50%': 'bg-center',
  '0% 0%': 'bg-left-top',
  '100% 100%': 'bg-right-bottom',
};

// Background repeat
export const BACKGROUND_REPEAT_MAP: Record<string, string> = {
  'repeat': 'bg-repeat',
  'no-repeat': 'bg-no-repeat',
  'repeat-x': 'bg-repeat-x',
  'repeat-y': 'bg-repeat-y',
  'round': 'bg-repeat-round',
  'space': 'bg-repeat-space',
};

// Flex basis keywords
export const FLEX_BASIS_MAP: Record<string, string> = {
  'auto': 'basis-auto',
  '100%': 'basis-full',
  '0px': 'basis-0',
  '0': 'basis-0',
};

// Grid template columns common patterns
export const GRID_COLS_MAP: Record<string, string> = {
  'none': 'grid-cols-none',
  'subgrid': 'grid-cols-subgrid',
  'repeat(1, minmax(0, 1fr))': 'grid-cols-1',
  'repeat(2, minmax(0, 1fr))': 'grid-cols-2',
  'repeat(3, minmax(0, 1fr))': 'grid-cols-3',
  'repeat(4, minmax(0, 1fr))': 'grid-cols-4',
  'repeat(5, minmax(0, 1fr))': 'grid-cols-5',
  'repeat(6, minmax(0, 1fr))': 'grid-cols-6',
  'repeat(7, minmax(0, 1fr))': 'grid-cols-7',
  'repeat(8, minmax(0, 1fr))': 'grid-cols-8',
  'repeat(9, minmax(0, 1fr))': 'grid-cols-9',
  'repeat(10, minmax(0, 1fr))': 'grid-cols-10',
  'repeat(11, minmax(0, 1fr))': 'grid-cols-11',
  'repeat(12, minmax(0, 1fr))': 'grid-cols-12',
};

// Grid template rows common patterns
export const GRID_ROWS_MAP: Record<string, string> = {
  'none': 'grid-rows-none',
  'subgrid': 'grid-rows-subgrid',
  'repeat(1, minmax(0, 1fr))': 'grid-rows-1',
  'repeat(2, minmax(0, 1fr))': 'grid-rows-2',
  'repeat(3, minmax(0, 1fr))': 'grid-rows-3',
  'repeat(4, minmax(0, 1fr))': 'grid-rows-4',
  'repeat(5, minmax(0, 1fr))': 'grid-rows-5',
  'repeat(6, minmax(0, 1fr))': 'grid-rows-6',
};

// Grid auto flow
export const GRID_AUTO_FLOW_MAP: Record<string, string> = {
  'row': 'grid-flow-row',
  'column': 'grid-flow-col',
  'dense': 'grid-flow-dense',
  'row dense': 'grid-flow-row-dense',
  'column dense': 'grid-flow-col-dense',
};
