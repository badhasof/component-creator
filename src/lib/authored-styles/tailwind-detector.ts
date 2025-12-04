/**
 * Tailwind Class Detector
 *
 * Detects whether a class name is a Tailwind utility class.
 * Uses pattern matching for common Tailwind prefixes and patterns.
 */

// Core Tailwind utility prefixes (covers vast majority of utility classes)
const TAILWIND_PREFIXES = new Set([
  // Layout
  'container', 'columns', 'break-after', 'break-before', 'break-inside',
  'box-decoration', 'box-', 'block', 'inline-block', 'inline', 'flex',
  'inline-flex', 'grid', 'inline-grid', 'contents', 'flow-root', 'hidden',
  'isolate', 'isolation-auto', 'float-', 'clear-', 'object-',

  // Flexbox & Grid
  'basis-', 'flex-', 'grow', 'grow-', 'shrink', 'shrink-', 'order-',
  'grid-cols-', 'col-', 'grid-rows-', 'row-', 'grid-flow-', 'auto-cols-',
  'auto-rows-', 'gap-', 'justify-', 'content-', 'items-', 'self-', 'place-',

  // Spacing
  'p-', 'px-', 'py-', 'pt-', 'pr-', 'pb-', 'pl-', 'ps-', 'pe-',
  'm-', 'mx-', 'my-', 'mt-', 'mr-', 'mb-', 'ml-', 'ms-', 'me-',
  'space-x-', 'space-y-',

  // Sizing
  'w-', 'min-w-', 'max-w-', 'h-', 'min-h-', 'max-h-', 'size-',

  // Typography
  'font-', 'text-', 'antialiased', 'subpixel-antialiased', 'italic',
  'not-italic', 'normal-nums', 'ordinal', 'slashed-zero', 'lining-nums',
  'oldstyle-nums', 'proportional-nums', 'tabular-nums', 'diagonal-fractions',
  'stacked-fractions', 'tracking-', 'leading-', 'list-', 'decoration-',
  'underline', 'overline', 'line-through', 'no-underline', 'uppercase',
  'lowercase', 'capitalize', 'normal-case', 'truncate', 'indent-',
  'align-', 'whitespace-', 'break-', 'hyphens-', 'content-',

  // Backgrounds
  'bg-', 'from-', 'via-', 'to-', 'gradient-',

  // Borders
  'rounded', 'rounded-', 'border', 'border-', 'divide-', 'outline',
  'outline-', 'ring', 'ring-', 'ring-offset-',

  // Effects
  'shadow', 'shadow-', 'opacity-', 'mix-blend-', 'bg-blend-',

  // Filters
  'blur', 'blur-', 'brightness-', 'contrast-', 'drop-shadow', 'drop-shadow-',
  'grayscale', 'hue-rotate-', 'invert', 'saturate-', 'sepia',
  'backdrop-blur', 'backdrop-blur-', 'backdrop-brightness-', 'backdrop-contrast-',
  'backdrop-grayscale', 'backdrop-hue-rotate-', 'backdrop-invert',
  'backdrop-opacity-', 'backdrop-saturate-', 'backdrop-sepia',

  // Tables
  'border-collapse', 'border-separate', 'border-spacing-', 'table-',
  'caption-',

  // Transitions & Animation
  'transition', 'transition-', 'duration-', 'ease-', 'delay-', 'animate-',

  // Transforms
  'scale-', 'rotate-', 'translate-', 'skew-', 'origin-', 'transform',
  'transform-',

  // Interactivity
  'accent-', 'appearance-', 'cursor-', 'caret-', 'pointer-events-',
  'resize', 'resize-', 'scroll-', 'snap-', 'touch-', 'select-',
  'will-change-',

  // SVG
  'fill-', 'stroke-',

  // Accessibility
  'sr-only', 'not-sr-only', 'forced-color-adjust-',

  // Position
  'static', 'fixed', 'absolute', 'relative', 'sticky',
  'inset-', 'top-', 'right-', 'bottom-', 'left-', 'start-', 'end-',
  'z-',

  // Visibility
  'visible', 'invisible', 'collapse',

  // Overflow
  'overflow-', 'overscroll-',

  // Aspect ratio
  'aspect-',

  // Typography plugin
  'prose', 'prose-',
]);

// Tailwind responsive prefixes
const RESPONSIVE_PREFIXES = ['sm:', 'md:', 'lg:', 'xl:', '2xl:'];

// Tailwind state prefixes
const STATE_PREFIXES = [
  'hover:', 'focus:', 'focus-within:', 'focus-visible:', 'active:',
  'visited:', 'target:', 'first:', 'last:', 'only:', 'odd:', 'even:',
  'first-of-type:', 'last-of-type:', 'only-of-type:', 'empty:', 'disabled:',
  'enabled:', 'checked:', 'indeterminate:', 'default:', 'required:',
  'valid:', 'invalid:', 'in-range:', 'out-of-range:', 'placeholder-shown:',
  'autofill:', 'read-only:', 'before:', 'after:', 'first-letter:',
  'first-line:', 'marker:', 'selection:', 'file:', 'backdrop:', 'placeholder:',
  'dark:', 'motion-safe:', 'motion-reduce:', 'contrast-more:', 'contrast-less:',
  'portrait:', 'landscape:', 'print:', 'rtl:', 'ltr:', 'open:', 'group-hover:',
  'group-focus:', 'peer-hover:', 'peer-focus:', 'aria-checked:', 'aria-disabled:',
  'aria-expanded:', 'aria-hidden:', 'aria-pressed:', 'aria-readonly:',
  'aria-required:', 'aria-selected:', 'supports-', 'data-', 'has-',
];

// Exact match Tailwind classes (no prefix pattern)
const EXACT_TAILWIND_CLASSES = new Set([
  'container', 'block', 'inline-block', 'inline', 'flex', 'inline-flex',
  'grid', 'inline-grid', 'contents', 'flow-root', 'hidden', 'isolate',
  'antialiased', 'subpixel-antialiased', 'italic', 'not-italic',
  'underline', 'overline', 'line-through', 'no-underline',
  'uppercase', 'lowercase', 'capitalize', 'normal-case', 'truncate',
  'static', 'fixed', 'absolute', 'relative', 'sticky',
  'visible', 'invisible', 'collapse',
  'grow', 'shrink',
  'border', 'rounded', 'shadow', 'outline', 'ring',
  'blur', 'grayscale', 'invert', 'sepia',
  'transition', 'transform', 'resize',
  'sr-only', 'not-sr-only',
  'prose',
]);

// Arbitrary value pattern: classname-[value]
const ARBITRARY_VALUE_REGEX = /^[a-z]+-\[.+\]$/i;

// Negative value pattern: -classname-value
const NEGATIVE_PREFIX_REGEX = /^-[a-z]+-/i;

/**
 * Check if a class name is a Tailwind utility class
 */
export function isTailwindClass(className: string): boolean {
  // Handle empty or whitespace-only
  if (!className || !className.trim()) return false;

  let testClass = className.trim();

  // Strip responsive and state prefixes to get base class
  for (const prefix of [...RESPONSIVE_PREFIXES, ...STATE_PREFIXES]) {
    if (testClass.startsWith(prefix)) {
      testClass = testClass.slice(prefix.length);
    }
  }

  // Handle multiple prefixes (e.g., "sm:hover:bg-blue-500")
  while (testClass.includes(':')) {
    const colonIndex = testClass.indexOf(':');
    testClass = testClass.slice(colonIndex + 1);
  }

  // Check exact matches first
  if (EXACT_TAILWIND_CLASSES.has(testClass)) return true;

  // Check negative prefix (e.g., -mt-4, -translate-x-full)
  if (NEGATIVE_PREFIX_REGEX.test(testClass)) {
    // Remove the leading dash and check again
    return isTailwindClass(testClass.slice(1));
  }

  // Check arbitrary values (e.g., bg-[#1da1f2], p-[17px])
  if (ARBITRARY_VALUE_REGEX.test(testClass)) return true;

  // Check prefix patterns
  for (const prefix of TAILWIND_PREFIXES) {
    if (testClass.startsWith(prefix)) return true;
    if (testClass === prefix.replace(/-$/, '')) return true; // Handle 'flex' matching 'flex-'
  }

  // Additional patterns for common Tailwind classes
  // Color classes like text-red-500, bg-blue-200, border-gray-300
  if (/^(text|bg|border|ring|outline|divide|from|via|to|fill|stroke|accent|caret|decoration|shadow)-(inherit|current|transparent|black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-\d+)?(\/\d+)?$/.test(testClass)) {
    return true;
  }

  // Spacing with numeric values (p-4, m-8, gap-2, etc.)
  if (/^(p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|space-x|space-y|w|h|min-w|min-h|max-w|max-h|size|inset|top|right|bottom|left|start|end|basis|translate-x|translate-y|scroll-m|scroll-p)-(\d+(\.\d+)?|auto|full|screen|min|max|fit|px)$/.test(testClass)) {
    return true;
  }

  // Fraction values (w-1/2, h-2/3, etc.)
  if (/^(w|h|min-w|min-h|max-w|max-h|basis|inset|top|right|bottom|left|translate-x|translate-y)-\d+\/\d+$/.test(testClass)) {
    return true;
  }

  // Grid columns/rows (grid-cols-3, col-span-2, row-span-full)
  if (/^(grid-cols|grid-rows|col-span|row-span|col-start|col-end|row-start|row-end|auto-cols|auto-rows)-(\d+|auto|full|none)$/.test(testClass)) {
    return true;
  }

  // Font sizes (text-xs, text-sm, text-base, etc.)
  if (/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/.test(testClass)) {
    return true;
  }

  // Font weights
  if (/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/.test(testClass)) {
    return true;
  }

  // Z-index
  if (/^z-(\d+|auto)$/.test(testClass)) {
    return true;
  }

  // Opacity
  if (/^opacity-\d+$/.test(testClass)) {
    return true;
  }

  // Duration and delay
  if (/^(duration|delay)-\d+$/.test(testClass)) {
    return true;
  }

  // Rotate, scale, skew
  if (/^(rotate|scale|scale-x|scale-y|skew-x|skew-y)-\d+$/.test(testClass)) {
    return true;
  }

  // Order
  if (/^order-(\d+|first|last|none)$/.test(testClass)) {
    return true;
  }

  return false;
}

/**
 * Split a className string and categorize into Tailwind and custom classes
 */
export function extractTailwindClasses(classNameString: string): {
  tailwindClasses: string[];
  customClasses: string[];
} {
  if (!classNameString || !classNameString.trim()) {
    return { tailwindClasses: [], customClasses: [] };
  }

  const allClasses = classNameString.split(/\s+/).filter(Boolean);
  const tailwindClasses: string[] = [];
  const customClasses: string[] = [];

  for (const cls of allClasses) {
    // Skip extension classes
    if (cls.startsWith('cc-')) continue;

    if (isTailwindClass(cls)) {
      tailwindClasses.push(cls);
    } else {
      customClasses.push(cls);
    }
  }

  return { tailwindClasses, customClasses };
}
