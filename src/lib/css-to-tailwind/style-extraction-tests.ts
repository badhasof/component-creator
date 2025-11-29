/**
 * Style Extraction Tests
 *
 * Tests the logic that extracts CSS properties and converts to Tailwind.
 * Simulates what StyleInspector does without needing a browser.
 *
 * Run with: npx tsx src/lib/css-to-tailwind/style-extraction-tests.ts
 */

import { cssToTailwind } from './converter';
import type { CSSProperties } from './types';

interface ExtractionTestCase {
  name: string;
  description: string;
  // Simulated computed styles (what getComputedStyle would return)
  computedStyles: Record<string, string>;
  // What we expect to be extracted and converted
  expectedClasses?: string[];
  // Classes that should NOT be present
  forbiddenClasses?: string[];
}

/**
 * Simulates the style extraction logic from StyleInspector
 */
function extractStyles(computed: Record<string, string>): CSSProperties {
  const inlineStyles: Record<string, string> = {};

  // Colors
  if (computed.color && computed.color !== 'rgb(0, 0, 0)') {
    inlineStyles.color = computed.color;
  }
  if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
    inlineStyles.backgroundColor = computed.backgroundColor;
  }

  // Typography
  if (computed.fontSize) inlineStyles.fontSize = computed.fontSize;
  if (computed.fontWeight && computed.fontWeight !== '400') {
    inlineStyles.fontWeight = computed.fontWeight;
  }
  if (computed.fontFamily) inlineStyles.fontFamily = computed.fontFamily;
  if (computed.lineHeight && computed.lineHeight !== 'normal') {
    inlineStyles.lineHeight = computed.lineHeight;
  }
  if (computed.letterSpacing && computed.letterSpacing !== 'normal') {
    inlineStyles.letterSpacing = computed.letterSpacing;
  }

  // Layout - detect grid from grid-specific properties
  // Only infer grid when display is 'block' (common media query case)
  // Don't infer for inline-block, flex, etc. which are explicit display values
  const hasGridTemplate = (computed.gridTemplateColumns && computed.gridTemplateColumns !== 'none') ||
                          (computed.gridTemplateRows && computed.gridTemplateRows !== 'none');

  if (hasGridTemplate && computed.display === 'block') {
    // Force grid display if grid template properties are set but display shows block
    inlineStyles.display = 'grid';
  } else if (computed.display && computed.display !== 'inline') {
    inlineStyles.display = computed.display;
  }

  if (computed.flexDirection && computed.flexDirection !== 'row') {
    inlineStyles.flexDirection = computed.flexDirection;
  }
  if (computed.alignItems && computed.alignItems !== 'normal') {
    inlineStyles.alignItems = computed.alignItems;
  }
  if (computed.justifyContent && computed.justifyContent !== 'normal') {
    inlineStyles.justifyContent = computed.justifyContent;
  }
  if (computed.flexWrap && computed.flexWrap !== 'nowrap') {
    inlineStyles.flexWrap = computed.flexWrap;
  }

  // Gap - only when effective display is flex or grid
  const effectiveDisplay = inlineStyles.display || computed.display;
  if (computed.gap && computed.gap !== 'normal' && computed.gap !== '0px') {
    if (effectiveDisplay === 'flex' || effectiveDisplay === 'inline-flex' ||
        effectiveDisplay === 'grid' || effectiveDisplay === 'inline-grid') {
      inlineStyles.gap = computed.gap;
    }
  }

  // Spacing
  if (computed.padding && computed.padding !== '0px') {
    inlineStyles.padding = computed.padding;
  }
  if (computed.margin && computed.margin !== '0px') {
    inlineStyles.margin = computed.margin;
  }

  // Borders
  if (computed.borderWidth && computed.borderWidth !== '0px') {
    inlineStyles.borderWidth = computed.borderWidth;
    if (computed.borderStyle) inlineStyles.borderStyle = computed.borderStyle;
    if (computed.borderColor) inlineStyles.borderColor = computed.borderColor;
  }
  if (computed.borderRadius && computed.borderRadius !== '0px') {
    inlineStyles.borderRadius = computed.borderRadius;
  }

  // Dimensions
  if (computed.width && !computed.width.includes('auto')) {
    inlineStyles.width = computed.width;
  }
  if (computed.height && !computed.height.includes('auto')) {
    inlineStyles.height = computed.height;
  }
  if (computed.minWidth && computed.minWidth !== '0px') {
    inlineStyles.minWidth = computed.minWidth;
  }
  if (computed.minHeight && computed.minHeight !== '0px') {
    inlineStyles.minHeight = computed.minHeight;
  }
  if (computed.maxWidth && computed.maxWidth !== 'none') {
    inlineStyles.maxWidth = computed.maxWidth;
  }
  if (computed.maxHeight && computed.maxHeight !== 'none') {
    inlineStyles.maxHeight = computed.maxHeight;
  }

  // Position
  if (computed.position && computed.position !== 'static') {
    inlineStyles.position = computed.position;
  }
  if (computed.position && computed.position !== 'static') {
    if (computed.top && computed.top !== 'auto') inlineStyles.top = computed.top;
    if (computed.right && computed.right !== 'auto') inlineStyles.right = computed.right;
    if (computed.bottom && computed.bottom !== 'auto') inlineStyles.bottom = computed.bottom;
    if (computed.left && computed.left !== 'auto') inlineStyles.left = computed.left;
  }
  if (computed.zIndex && computed.zIndex !== 'auto') {
    inlineStyles.zIndex = computed.zIndex;
  }

  // Grid properties - extract if display is grid OR if inferred grid (block + grid templates)
  const isGridContainer = computed.display === 'grid' || computed.display === 'inline-grid' ||
                          (computed.display === 'block' && (
                            (computed.gridTemplateColumns && computed.gridTemplateColumns !== 'none') ||
                            (computed.gridTemplateRows && computed.gridTemplateRows !== 'none')
                          ));
  if (isGridContainer) {
    if (computed.gridTemplateColumns && computed.gridTemplateColumns !== 'none') {
      inlineStyles.gridTemplateColumns = computed.gridTemplateColumns;
    }
    if (computed.gridTemplateRows && computed.gridTemplateRows !== 'none') {
      inlineStyles.gridTemplateRows = computed.gridTemplateRows;
    }
  }

  // Grid item properties
  if (computed.gridColumn && computed.gridColumn !== 'auto / auto') {
    inlineStyles.gridColumn = computed.gridColumn;
  }
  if (computed.gridRow && computed.gridRow !== 'auto / auto') {
    inlineStyles.gridRow = computed.gridRow;
  }

  // Flex item properties
  if (computed.flexGrow && computed.flexGrow !== '0') {
    inlineStyles.flexGrow = computed.flexGrow;
  }
  if (computed.flexShrink && computed.flexShrink !== '1') {
    inlineStyles.flexShrink = computed.flexShrink;
  }
  if (computed.flexBasis && computed.flexBasis !== 'auto') {
    inlineStyles.flexBasis = computed.flexBasis;
  }

  // Overflow
  if (computed.overflow && computed.overflow !== 'visible') {
    inlineStyles.overflow = computed.overflow;
  }

  // Text styling
  if (computed.textAlign && computed.textAlign !== 'start') {
    inlineStyles.textAlign = computed.textAlign;
  }
  if (computed.whiteSpace && computed.whiteSpace !== 'normal') {
    inlineStyles.whiteSpace = computed.whiteSpace;
  }
  if (computed.textTransform && computed.textTransform !== 'none') {
    inlineStyles.textTransform = computed.textTransform;
  }

  // Visibility
  if (computed.visibility && computed.visibility !== 'visible') {
    inlineStyles.visibility = computed.visibility;
  }
  if (computed.opacity && computed.opacity !== '1') {
    inlineStyles.opacity = computed.opacity;
  }

  // Cursor
  if (computed.cursor && computed.cursor !== 'auto') {
    inlineStyles.cursor = computed.cursor;
  }

  // Object fit
  if (computed.objectFit && computed.objectFit !== 'fill') {
    inlineStyles.objectFit = computed.objectFit;
  }

  // Box shadow
  if (computed.boxShadow && computed.boxShadow !== 'none') {
    inlineStyles.boxShadow = computed.boxShadow;
  }

  // Transform
  if (computed.transform && computed.transform !== 'none') {
    inlineStyles.transform = computed.transform;
  }

  return inlineStyles as CSSProperties;
}

function runTest(test: ExtractionTestCase): { passed: boolean; errors: string[] } {
  const errors: string[] = [];

  const extracted = extractStyles(test.computedStyles);
  const result = cssToTailwind(extracted);

  // Check expected classes
  if (test.expectedClasses) {
    for (const expected of test.expectedClasses) {
      if (!result.classes.includes(expected)) {
        errors.push(`Missing expected class: ${expected}`);
      }
    }
  }

  // Check forbidden classes
  if (test.forbiddenClasses) {
    for (const forbidden of test.forbiddenClasses) {
      if (result.classes.some(c => c.includes(forbidden))) {
        errors.push(`Found forbidden class containing: ${forbidden}`);
      }
    }
  }

  return { passed: errors.length === 0, errors };
}

// =============================================================================
// TEST BATCH 1: Gap and Layout Issues
// =============================================================================

const testBatch1: ExtractionTestCase[] = [
  {
    name: 'Block element with gap should NOT have gap class',
    description: 'When display is block (and no grid templates), gap has no effect',
    computedStyles: {
      display: 'block',
      gap: '40px 64px',
      width: '1292px',
      height: '1209.8px',
    },
    forbiddenClasses: ['gap'],
  },
  {
    name: 'INFER GRID: Block with gridTemplateColumns should become grid',
    description: 'When display is block but gridTemplateColumns exists, infer grid',
    computedStyles: {
      display: 'block',
      gridTemplateColumns: '1fr 1fr',
      gap: '40px 64px',
    },
    expectedClasses: ['grid', 'grid-cols-[1fr_1fr]', 'gap-[40px_64px]'],
    forbiddenClasses: ['block'],
  },
  {
    name: 'Grid element with gap SHOULD have gap class',
    description: 'When display is grid, gap should be extracted',
    computedStyles: {
      display: 'grid',
      gap: '40px 64px',
      gridTemplateColumns: '1fr 1fr',
    },
    expectedClasses: ['grid', 'gap-[40px_64px]'],
  },
  {
    name: 'Flex element with gap SHOULD have gap class',
    description: 'When display is flex, gap should be extracted',
    computedStyles: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
    },
    expectedClasses: ['flex', 'gap-4', 'items-center'],
  },
  {
    name: 'Inline-flex with gap SHOULD have gap class',
    description: 'Inline-flex also supports gap',
    computedStyles: {
      display: 'inline-flex',
      gap: '8px',
    },
    expectedClasses: ['inline-flex', 'gap-2'],
  },
  {
    name: 'Inline-grid with gap SHOULD have gap class',
    description: 'Inline-grid also supports gap',
    computedStyles: {
      display: 'inline-grid',
      gap: '24px',
      gridTemplateColumns: '100px 100px',
    },
    expectedClasses: ['inline-grid', 'gap-6'],
  },
  {
    name: 'List-item with gap should NOT have gap class',
    description: 'List-item display does not support gap',
    computedStyles: {
      display: 'list-item',
      gap: '20px',
    },
    forbiddenClasses: ['gap'],
  },
  {
    name: 'Inline element with gap should NOT have gap class',
    description: 'Inline display does not support gap',
    computedStyles: {
      display: 'inline',
      gap: '10px',
    },
    forbiddenClasses: ['gap'],
  },
  {
    name: 'Table element with gap should NOT have gap class',
    description: 'Table display does not support gap (uses border-spacing)',
    computedStyles: {
      display: 'table',
      gap: '10px',
    },
    forbiddenClasses: ['gap'],
  },
  {
    name: 'Grid with multi-value gap escapes spaces',
    description: 'Multi-value gaps should have underscores',
    computedStyles: {
      display: 'grid',
      gap: '20px 40px',
      gridTemplateColumns: '1fr 1fr 1fr',
    },
    expectedClasses: ['gap-[20px_40px]'],
    forbiddenClasses: ['gap-[20px 40px]'], // No spaces!
  },
  {
    name: 'Flex column with gap and direction',
    description: 'Flex column layout with gap',
    computedStyles: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      alignItems: 'stretch',
    },
    expectedClasses: ['flex', 'flex-col', 'gap-8'],
  },
];

// =============================================================================
// TEST RUNNER
// =============================================================================

function runTestBatch(tests: ExtractionTestCase[], batchName: string): boolean {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${batchName}`);
  console.log(`${'='.repeat(70)}\n`);

  let passed = 0;
  let failed = 0;
  const failures: { test: ExtractionTestCase; errors: string[] }[] = [];

  for (const test of tests) {
    const result = runTest(test);
    if (result.passed) {
      passed++;
      console.log(`  ✓ ${test.name}`);
    } else {
      failed++;
      console.log(`  ✗ ${test.name}`);
      for (const error of result.errors) {
        console.log(`    → ${error}`);
      }
      failures.push({ test, errors: result.errors });
    }
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Results: ${passed}/${tests.length} passed`);

  if (failed > 0) {
    console.log(`\nFailed tests:`);
    for (const { test } of failures) {
      console.log(`  - ${test.name}: ${test.description}`);
    }
  }

  console.log(`${'='.repeat(70)}\n`);

  return failed === 0;
}

// =============================================================================
// TEST BATCH 2: Grid Layout Edge Cases
// =============================================================================

const testBatch2: ExtractionTestCase[] = [
  {
    name: 'Grid with 12-column template',
    description: 'Complex grid-template-columns with many values',
    computedStyles: {
      display: 'grid',
      gridTemplateColumns: '49px 49px 49px 49px 49px 49px 49px 49px 49px 49px 49px 49px',
      gridTemplateRows: '640px',
      gap: '40px 64px',
    },
    expectedClasses: ['grid', 'grid-cols-[49px_49px_49px_49px_49px_49px_49px_49px_49px_49px_49px_49px]'],
    forbiddenClasses: ['block'],
  },
  {
    name: 'Grid item with span',
    description: 'Grid column span should have underscores',
    computedStyles: {
      display: 'block',
      gridColumn: 'span 6 / span 6',
    },
    expectedClasses: ['col-span-6'],
  },
  {
    name: 'Grid item with start/end',
    description: 'Grid column with start and span',
    computedStyles: {
      display: 'block',
      gridColumn: '1 / span 12',
    },
    expectedClasses: ['col-[1_/_span_12]'],
    forbiddenClasses: ['col-[1 / span 12]'],
  },
  {
    name: 'Grid row span',
    description: 'Grid row with span value',
    computedStyles: {
      display: 'block',
      gridRow: 'span 2 / span 2',
    },
    expectedClasses: ['row-span-2'],
  },
  {
    name: 'Grid with fr units',
    description: 'Grid template with fr units',
    computedStyles: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1fr',
      gap: '16px',
    },
    expectedClasses: ['grid', 'grid-cols-[1fr_2fr_1fr]', 'gap-4'],
  },
  {
    name: 'Grid with mixed units',
    description: 'Grid template with px, fr, and auto',
    computedStyles: {
      display: 'grid',
      gridTemplateColumns: '200px 1fr auto',
    },
    expectedClasses: ['grid', 'grid-cols-[200px_1fr_auto]'],
  },
  {
    name: 'Inline-block should NOT extract grid properties',
    description: 'Grid properties only for grid display',
    computedStyles: {
      display: 'inline-block',
      gridTemplateColumns: '100px 100px',
    },
    expectedClasses: ['inline-block'],
    forbiddenClasses: ['grid-cols'],
  },
  {
    name: 'Grid auto-flow column',
    description: 'Grid with non-default auto-flow',
    computedStyles: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    },
    expectedClasses: ['grid'],
  },
  {
    name: 'Nested grid item properties',
    description: 'Element inside grid with positioning',
    computedStyles: {
      display: 'flex',
      gridColumn: '2 / 4',
      gridRow: '1 / 3',
      alignItems: 'center',
    },
    expectedClasses: ['flex', 'items-center', 'col-[2_/_4]', 'row-[1_/_3]'],
  },
  {
    name: 'Grid with repeat values (computed)',
    description: 'Grid columns that look like repeat output',
    computedStyles: {
      display: 'grid',
      gridTemplateColumns: '100px 100px 100px 100px',
      gap: '0px', // no gap
    },
    expectedClasses: ['grid', 'grid-cols-[100px_100px_100px_100px]'],
    forbiddenClasses: ['gap'],
  },
];

// =============================================================================
// TEST BATCH 3: Flex Layout and Spacing
// =============================================================================

const testBatch3: ExtractionTestCase[] = [
  {
    name: 'Flex with all properties',
    description: 'Complete flex container setup',
    computedStyles: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '24px',
    },
    expectedClasses: ['flex', 'items-center', 'justify-between', 'gap-6'],
    forbiddenClasses: ['flex-row'], // row is default, should not appear
  },
  {
    name: 'Flex column reverse',
    description: 'Flex with column-reverse direction',
    computedStyles: {
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: '8px',
    },
    expectedClasses: ['flex', 'flex-col-reverse', 'gap-2'],
  },
  {
    name: 'Flex item with grow and shrink',
    description: 'Flex item properties',
    computedStyles: {
      display: 'block',
      flexGrow: '1',
      flexShrink: '0',
      flexBasis: '200px',
    },
    expectedClasses: ['grow', 'shrink-0', 'basis-[200px]'],
  },
  {
    name: 'Complex padding shorthand',
    description: '4-value padding should split correctly',
    computedStyles: {
      display: 'block',
      padding: '10px 20px 30px 40px',
    },
    expectedClasses: ['pt-2.5', 'pr-5', 'pb-[30px]', 'pl-10'],
  },
  {
    name: 'Margin auto for centering',
    description: 'Horizontal centering with margin auto',
    computedStyles: {
      display: 'block',
      margin: '0px auto',
      width: '800px',
    },
    expectedClasses: ['my-0', 'mx-auto', 'w-[800px]'],
  },
  {
    name: 'Flex wrap',
    description: 'Flex container with wrap',
    computedStyles: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px 32px',
    },
    expectedClasses: ['flex', 'flex-wrap', 'gap-[16px_32px]'],
  },
  {
    name: 'Flex with justify-items',
    description: 'Flex with end alignment',
    computedStyles: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
    },
    expectedClasses: ['flex', 'justify-end', 'items-start'],
  },
  {
    name: 'Negative margin',
    description: 'Negative margin values',
    computedStyles: {
      display: 'block',
      margin: '-8px',
    },
    expectedClasses: ['-m-2'],
  },
  {
    name: 'Zero padding should not appear',
    description: 'Default padding should be skipped',
    computedStyles: {
      display: 'block',
      padding: '0px',
      margin: '16px',
    },
    expectedClasses: ['m-4'],
    forbiddenClasses: ['p-0'],
  },
];

// =============================================================================
// TEST BATCH 4: Positioning, Dimensions, and Visibility
// =============================================================================

const testBatch4: ExtractionTestCase[] = [
  {
    name: 'Absolute positioning with offsets',
    description: 'Position absolute with all four offsets',
    computedStyles: {
      display: 'block',
      position: 'absolute',
      top: '16px',
      right: '24px',
      bottom: '0px',
      left: '32px',
    },
    expectedClasses: ['absolute', 'top-4', 'right-6', 'bottom-0', 'left-8'],
  },
  {
    name: 'Fixed position with z-index',
    description: 'Fixed element with high z-index',
    computedStyles: {
      display: 'flex',
      position: 'fixed',
      top: '0px',
      left: '0px',
      zIndex: '50',
    },
    expectedClasses: ['flex', 'fixed', 'top-0', 'left-0', 'z-50'],
  },
  {
    name: 'Static position should not output position class',
    description: 'Static is default, should be skipped',
    computedStyles: {
      display: 'block',
      position: 'static',
      top: '10px', // should be ignored since static
    },
    expectedClasses: ['block'],
    forbiddenClasses: ['static', 'top'],
  },
  {
    name: 'Relative with percentage dimensions',
    description: 'Relative position with percentage width/height',
    computedStyles: {
      display: 'block',
      position: 'relative',
      width: '100%',
      height: '50%',
    },
    expectedClasses: ['relative', 'w-full', 'h-1/2'],
  },
  {
    name: 'Min and max dimensions',
    description: 'Element with min/max constraints',
    computedStyles: {
      display: 'block',
      minWidth: '200px',
      maxWidth: '800px',
      minHeight: '100px',
      maxHeight: '600px',
    },
    expectedClasses: ['min-w-[200px]', 'max-w-[800px]', 'min-h-[100px]', 'max-h-[600px]'],
  },
  {
    name: 'Hidden visibility',
    description: 'Element with visibility hidden',
    computedStyles: {
      display: 'block',
      visibility: 'hidden',
    },
    expectedClasses: ['invisible'],
  },
  {
    name: 'Opacity 50%',
    description: 'Semi-transparent element',
    computedStyles: {
      display: 'block',
      opacity: '0.5',
    },
    expectedClasses: ['opacity-50'],
  },
  {
    name: 'Overflow hidden',
    description: 'Container with hidden overflow',
    computedStyles: {
      display: 'block',
      overflow: 'hidden',
      borderRadius: '8px',
    },
    expectedClasses: ['overflow-hidden', 'rounded-lg'],
  },
  {
    name: 'Cursor pointer',
    description: 'Clickable element styling',
    computedStyles: {
      display: 'inline-flex',
      cursor: 'pointer',
    },
    expectedClasses: ['inline-flex', 'cursor-pointer'],
  },
  {
    name: 'Object fit cover for images',
    description: 'Image with cover fit',
    computedStyles: {
      display: 'block',
      width: '100%',
      height: '200px',
      objectFit: 'cover',
    },
    expectedClasses: ['w-full', 'h-[200px]', 'object-cover'],
  },
];

// =============================================================================
// TEST BATCH 5: Colors, Typography, and Borders
// =============================================================================

const testBatch5: ExtractionTestCase[] = [
  {
    name: 'Text color blue-500',
    description: 'Standard Tailwind color',
    computedStyles: {
      display: 'block',
      color: 'rgb(59, 130, 246)',
    },
    expectedClasses: ['text-blue-500'],
  },
  {
    name: 'Background with transparency',
    description: 'Semi-transparent background',
    computedStyles: {
      display: 'block',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    expectedClasses: ['bg-black/50'],
  },
  {
    name: 'Font size and weight',
    description: 'Typography combination',
    computedStyles: {
      display: 'block',
      fontSize: '24px',
      fontWeight: '700',
      lineHeight: '32px',
    },
    expectedClasses: ['text-2xl', 'font-bold', 'leading-8'],
  },
  {
    name: 'Letter spacing',
    description: 'Tracking value',
    computedStyles: {
      display: 'block',
      letterSpacing: '-0.025em',
    },
    expectedClasses: ['tracking-tight'],
  },
  {
    name: 'Text transform uppercase',
    description: 'Uppercase text',
    computedStyles: {
      display: 'block',
      textTransform: 'uppercase',
    },
    expectedClasses: ['uppercase'],
  },
  {
    name: 'White space nowrap',
    description: 'No wrap text',
    computedStyles: {
      display: 'block',
      whiteSpace: 'nowrap',
    },
    expectedClasses: ['whitespace-nowrap'],
  },
  {
    name: 'Border with radius',
    description: 'Complete border styling',
    computedStyles: {
      display: 'block',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'rgb(229, 231, 235)',
      borderRadius: '8px',
    },
    expectedClasses: ['border', 'border-solid', 'border-gray-200', 'rounded-lg'],
  },
  {
    name: 'Large border radius (pill)',
    description: 'Full rounded for pill shapes',
    computedStyles: {
      display: 'inline-flex',
      borderRadius: '9999px',
      padding: '8px 16px',
    },
    expectedClasses: ['inline-flex', 'rounded-full', 'py-2', 'px-4'],
  },
  {
    name: 'Box shadow',
    description: 'Element with shadow',
    computedStyles: {
      display: 'block',
      boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    expectedClasses: ['shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1)]'],
  },
  {
    name: 'Text align center',
    description: 'Centered text',
    computedStyles: {
      display: 'block',
      textAlign: 'center',
    },
    expectedClasses: ['text-center'],
  },
];

// Run tests
let allPassed = true;

allPassed = runTestBatch(testBatch1, 'TEST BATCH 1: Gap and Layout Issues') && allPassed;
allPassed = runTestBatch(testBatch2, 'TEST BATCH 2: Grid Layout Edge Cases') && allPassed;
allPassed = runTestBatch(testBatch3, 'TEST BATCH 3: Flex Layout and Spacing') && allPassed;
allPassed = runTestBatch(testBatch4, 'TEST BATCH 4: Positioning, Dimensions, and Visibility') && allPassed;
allPassed = runTestBatch(testBatch5, 'TEST BATCH 5: Colors, Typography, and Borders') && allPassed;

process.exit(allPassed ? 0 : 1);
