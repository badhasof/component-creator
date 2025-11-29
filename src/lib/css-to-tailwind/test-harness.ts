/**
 * CSS to Tailwind Test Harness
 *
 * Run with: npx tsx src/lib/css-to-tailwind/test-harness.ts
 *
 * This file allows standalone testing of the CSS-to-Tailwind converter
 * before integrating it into the Chrome extension.
 */

import { cssToTailwind } from './converter';
import type { CSSProperties, TestCase } from './types';

// =============================================================================
// TEST CASES
// =============================================================================

const testCases: TestCase[] = [
  // ---------------------------------------------------------------------------
  // COLORS
  // ---------------------------------------------------------------------------
  {
    name: 'Standard Tailwind blue-500',
    category: 'colors',
    input: { backgroundColor: 'rgb(59, 130, 246)' },
    expectedClasses: ['bg-blue-500'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Black text',
    category: 'colors',
    input: { color: 'rgb(0, 0, 0)' },
    expectedClasses: ['text-black'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'White background',
    category: 'colors',
    input: { backgroundColor: 'rgb(255, 255, 255)' },
    expectedClasses: ['bg-white'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Transparent background',
    category: 'colors',
    input: { backgroundColor: 'transparent' },
    expectedClasses: ['bg-transparent'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Semi-transparent blue (50%)',
    category: 'colors',
    input: { backgroundColor: 'rgba(59, 130, 246, 0.5)' },
    expectedClasses: ['bg-blue-500/50'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Gray-200 border',
    category: 'colors',
    input: { borderColor: 'rgb(229, 231, 235)' },
    expectedClasses: ['border-gray-200'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Non-standard color (arbitrary)',
    category: 'colors',
    input: { backgroundColor: 'rgb(123, 45, 67)' },
    expectedArbitraryMax: 1,
  },
  {
    name: 'Hex color #3b82f6 (blue-500)',
    category: 'colors',
    input: { backgroundColor: '#3b82f6' },
    expectedClasses: ['bg-blue-500'],
    expectedArbitraryMax: 0,
  },

  // ---------------------------------------------------------------------------
  // SPACING
  // ---------------------------------------------------------------------------
  {
    name: 'Padding 16px (p-4)',
    category: 'spacing',
    input: { padding: '16px' },
    expectedClasses: ['p-4'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Padding 0 (p-0)',
    category: 'spacing',
    input: { padding: '0px' },
    expectedClasses: ['p-0'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Padding 17px (arbitrary)',
    category: 'spacing',
    input: { padding: '17px' },
    expectedClasses: ['p-[17px]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Padding shorthand 8px 16px',
    category: 'spacing',
    input: { padding: '8px 16px' },
    expectedClasses: ['py-2', 'px-4'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Padding shorthand 4px 8px 12px 16px',
    category: 'spacing',
    input: { padding: '4px 8px 12px 16px' },
    expectedClasses: ['pt-1', 'pr-2', 'pb-3', 'pl-4'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Margin auto',
    category: 'spacing',
    input: { marginLeft: 'auto', marginRight: 'auto' },
    expectedClasses: ['ml-auto', 'mr-auto'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Negative margin -8px',
    category: 'spacing',
    input: { marginTop: '-8px' },
    expectedClasses: ['-mt-2'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Gap 24px',
    category: 'spacing',
    input: { gap: '24px' },
    expectedClasses: ['gap-6'],
    expectedArbitraryMax: 0,
  },

  // ---------------------------------------------------------------------------
  // TYPOGRAPHY
  // ---------------------------------------------------------------------------
  {
    name: 'Font size 16px (text-base)',
    category: 'typography',
    input: { fontSize: '16px' },
    expectedClasses: ['text-base'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Font size 14px (text-sm)',
    category: 'typography',
    input: { fontSize: '14px' },
    expectedClasses: ['text-sm'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Font size 24px (text-2xl)',
    category: 'typography',
    input: { fontSize: '24px' },
    expectedClasses: ['text-2xl'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Font size 15px (arbitrary)',
    category: 'typography',
    input: { fontSize: '15px' },
    expectedClasses: ['text-[15px]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Font weight 700 (font-bold)',
    category: 'typography',
    input: { fontWeight: '700' },
    expectedClasses: ['font-bold'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Font weight 500 (font-medium)',
    category: 'typography',
    input: { fontWeight: '500' },
    expectedClasses: ['font-medium'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Line height 1.5 (leading-normal)',
    category: 'typography',
    input: { lineHeight: '1.5' },
    expectedClasses: ['leading-normal'],
    expectedArbitraryMax: 0,
  },

  // ---------------------------------------------------------------------------
  // LAYOUT
  // ---------------------------------------------------------------------------
  {
    name: 'Display flex',
    category: 'layout',
    input: { display: 'flex' },
    expectedClasses: ['flex'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Display grid',
    category: 'layout',
    input: { display: 'grid' },
    expectedClasses: ['grid'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Display none (hidden)',
    category: 'layout',
    input: { display: 'none' },
    expectedClasses: ['hidden'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Flex column',
    category: 'layout',
    input: { display: 'flex', flexDirection: 'column' },
    expectedClasses: ['flex', 'flex-col'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Flex centered',
    category: 'layout',
    input: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    expectedClasses: ['flex', 'items-center', 'justify-center'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Flex space-between',
    category: 'layout',
    input: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    expectedClasses: ['flex', 'justify-between'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Flex wrap',
    category: 'layout',
    input: { flexWrap: 'wrap' },
    expectedClasses: ['flex-wrap'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Flex grow',
    category: 'layout',
    input: { flexGrow: '1' },
    expectedClasses: ['grow'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Flex shrink-0',
    category: 'layout',
    input: { flexShrink: '0' },
    expectedClasses: ['shrink-0'],
    expectedArbitraryMax: 0,
  },

  // ---------------------------------------------------------------------------
  // BORDERS
  // ---------------------------------------------------------------------------
  {
    name: 'Border radius 8px (rounded-lg)',
    category: 'borders',
    input: { borderRadius: '8px' },
    expectedClasses: ['rounded-lg'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Border radius 4px (rounded)',
    category: 'borders',
    input: { borderRadius: '4px' },
    expectedClasses: ['rounded'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Border radius 9999px (rounded-full)',
    category: 'borders',
    input: { borderRadius: '9999px' },
    expectedClasses: ['rounded-full'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Border radius 10px (arbitrary)',
    category: 'borders',
    input: { borderRadius: '10px' },
    expectedClasses: ['rounded-[10px]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Border width 1px',
    category: 'borders',
    input: { borderWidth: '1px' },
    expectedClasses: ['border'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Border width 2px',
    category: 'borders',
    input: { borderWidth: '2px' },
    expectedClasses: ['border-2'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Border style dashed',
    category: 'borders',
    input: { borderStyle: 'dashed' },
    expectedClasses: ['border-dashed'],
    expectedArbitraryMax: 0,
  },

  // ---------------------------------------------------------------------------
  // POSITION
  // ---------------------------------------------------------------------------
  {
    name: 'Position absolute',
    category: 'position',
    input: { position: 'absolute' },
    expectedClasses: ['absolute'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Position relative',
    category: 'position',
    input: { position: 'relative' },
    expectedClasses: ['relative'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Absolute top-0 left-0',
    category: 'position',
    input: {
      position: 'absolute',
      top: '0px',
      left: '0px',
    },
    expectedClasses: ['absolute', 'top-0', 'left-0'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Position inset values',
    category: 'position',
    input: {
      position: 'absolute',
      top: '16px',
      right: '16px',
    },
    expectedClasses: ['absolute', 'top-4', 'right-4'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Z-index 10',
    category: 'position',
    input: { zIndex: '10' },
    expectedClasses: ['z-10'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Z-index 999 (arbitrary)',
    category: 'position',
    input: { zIndex: '999' },
    expectedClasses: ['z-[999]'],
    expectedArbitraryMax: 1,
  },

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------
  {
    name: 'Opacity 50%',
    category: 'effects',
    input: { opacity: '0.5' },
    expectedClasses: ['opacity-50'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Opacity 75%',
    category: 'effects',
    input: { opacity: '0.75' },
    expectedClasses: ['opacity-75'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Overflow hidden',
    category: 'effects',
    input: { overflow: 'hidden' },
    expectedClasses: ['overflow-hidden'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Overflow auto',
    category: 'effects',
    input: { overflow: 'auto' },
    expectedClasses: ['overflow-auto'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Cursor pointer',
    category: 'effects',
    input: { cursor: 'pointer' },
    expectedClasses: ['cursor-pointer'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Pointer events none',
    category: 'effects',
    input: { pointerEvents: 'none' },
    expectedClasses: ['pointer-events-none'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'User select none',
    category: 'effects',
    input: { userSelect: 'none' },
    expectedClasses: ['select-none'],
    expectedArbitraryMax: 0,
  },

  // ---------------------------------------------------------------------------
  // TEXT STYLING
  // ---------------------------------------------------------------------------
  {
    name: 'Text align center',
    category: 'typography',
    input: { textAlign: 'center' },
    expectedClasses: ['text-center'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Text uppercase',
    category: 'typography',
    input: { textTransform: 'uppercase' },
    expectedClasses: ['uppercase'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Text underline',
    category: 'typography',
    input: { textDecorationLine: 'underline' },
    expectedClasses: ['underline'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Whitespace nowrap',
    category: 'typography',
    input: { whiteSpace: 'nowrap' },
    expectedClasses: ['whitespace-nowrap'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Text overflow ellipsis',
    category: 'typography',
    input: { textOverflow: 'ellipsis' },
    expectedClasses: ['text-ellipsis'],
    expectedArbitraryMax: 0,
  },

  // ---------------------------------------------------------------------------
  // DIMENSIONS
  // ---------------------------------------------------------------------------
  {
    name: 'Width 100%',
    category: 'layout',
    input: { width: '100%' },
    expectedClasses: ['w-full'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Width 50%',
    category: 'layout',
    input: { width: '50%' },
    expectedClasses: ['w-1/2'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Width 64px (w-16)',
    category: 'layout',
    input: { width: '64px' },
    expectedClasses: ['w-16'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Width 100vw (w-screen)',
    category: 'layout',
    input: { width: '100vw' },
    expectedClasses: ['w-screen'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Height auto',
    category: 'layout',
    input: { height: 'auto' },
    expectedClasses: ['h-auto'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Min height 100vh (min-h-screen)',
    category: 'layout',
    input: { minHeight: '100vh' },
    expectedClasses: ['min-h-screen'],
    expectedArbitraryMax: 0,
  },
  {
    name: 'Max width arbitrary',
    category: 'layout',
    input: { maxWidth: '500px' },
    expectedClasses: ['max-w-[500px]'],
    expectedArbitraryMax: 1,
  },

  // ---------------------------------------------------------------------------
  // ARBITRARY VALUE ESCAPING (spaces → underscores)
  // ---------------------------------------------------------------------------
  {
    name: 'Grid columns with spaces',
    category: 'arbitrary-escaping',
    input: { gridTemplateColumns: '49px 49px 49px' },
    expectedClasses: ['grid-cols-[49px_49px_49px]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Grid columns 12-column layout',
    category: 'arbitrary-escaping',
    input: { gridTemplateColumns: '1fr 1fr 1fr 1fr' },
    expectedClasses: ['grid-cols-[1fr_1fr_1fr_1fr]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Grid rows with spaces',
    category: 'arbitrary-escaping',
    input: { gridTemplateRows: '100px 200px 100px' },
    expectedClasses: ['grid-rows-[100px_200px_100px]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Grid column span',
    category: 'arbitrary-escaping',
    input: { gridColumn: 'span 6' },
    expectedClasses: ['col-[span_6]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Grid column start/end',
    category: 'arbitrary-escaping',
    input: { gridColumn: '1 / span 12' },
    expectedClasses: ['col-[1_/_span_12]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Grid row span',
    category: 'arbitrary-escaping',
    input: { gridRow: 'span 2' },
    expectedClasses: ['row-[span_2]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Border radius 4-value shorthand',
    category: 'arbitrary-escaping',
    input: { borderRadius: '16px 16px 0px 0px' },
    expectedClasses: ['rounded-[16px_16px_0px_0px]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Border radius 2-value shorthand',
    category: 'arbitrary-escaping',
    input: { borderRadius: '8px 0px' },
    expectedClasses: ['rounded-[8px_0px]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Gap two values (row col)',
    category: 'arbitrary-escaping',
    input: { gap: '40px 64px' },
    expectedClasses: ['gap-[40px_64px]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Gap with normal keyword',
    category: 'arbitrary-escaping',
    input: { gap: 'normal 64px' },
    expectedClasses: ['gap-[normal_64px]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Complex transform with spaces',
    category: 'arbitrary-escaping',
    input: { transform: 'matrix(1, 0, 0, 1, 0, 0)' },
    expectedClasses: ['[transform:matrix(1,_0,_0,_1,_0,_0)]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Box shadow with spaces',
    category: 'arbitrary-escaping',
    input: { boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' },
    expectedClasses: ['shadow-[0px_4px_6px_rgba(0,_0,_0,_0.1)]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Object position with space',
    category: 'arbitrary-escaping',
    input: { objectPosition: '50% 25%' },
    expectedClasses: ['object-[50%_25%]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Background position arbitrary',
    category: 'arbitrary-escaping',
    input: { backgroundPosition: '10px 20px' },
    expectedClasses: ['bg-[position:10px_20px]'],
    expectedArbitraryMax: 1,
  },
  {
    name: 'Text shadow with spaces',
    category: 'arbitrary-escaping',
    input: { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' },
    expectedClasses: ['[text-shadow:2px_2px_4px_rgba(0,_0,_0,_0.5)]'],
    expectedArbitraryMax: 1,
  },

  // ---------------------------------------------------------------------------
  // COMPLEX / REAL-WORLD
  // ---------------------------------------------------------------------------
  {
    name: 'Button element',
    category: 'complex',
    input: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: 'rgb(59, 130, 246)',
      color: 'rgb(255, 255, 255)',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    expectedClasses: [
      'inline-flex', 'items-center', 'justify-center',
      'py-2', 'px-4', 'text-sm', 'font-medium',
      'bg-blue-500', 'text-white', 'rounded-md', 'cursor-pointer'
    ],
  },
  {
    name: 'Card element',
    category: 'complex',
    input: {
      backgroundColor: 'rgb(255, 255, 255)',
      borderRadius: '8px',
      padding: '24px',
      borderWidth: '1px',
      borderColor: 'rgb(229, 231, 235)',
    },
    expectedClasses: ['bg-white', 'rounded-lg', 'p-6', 'border', 'border-gray-200'],
  },
  {
    name: 'Avatar/Profile image',
    category: 'complex',
    input: {
      width: '48px',
      height: '48px',
      borderRadius: '9999px',
      objectFit: 'cover',
    },
    expectedClasses: ['w-12', 'h-12', 'rounded-full', 'object-cover'],
  },
  {
    name: 'Modal overlay',
    category: 'complex',
    input: {
      position: 'fixed',
      top: '0px',
      left: '0px',
      right: '0px',
      bottom: '0px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '50',
    },
    expectedClasses: [
      'fixed', 'top-0', 'left-0', 'right-0', 'bottom-0',
      'bg-black/50', 'flex', 'items-center', 'justify-center', 'z-50'
    ],
  },
  {
    name: 'Navigation link',
    category: 'complex',
    input: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      fontSize: '14px',
      fontWeight: '500',
      color: 'rgb(107, 114, 128)',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    expectedClasses: [
      'flex', 'items-center', 'gap-2', 'py-2', 'px-3',
      'text-sm', 'font-medium', 'text-gray-500', 'rounded-md', 'cursor-pointer'
    ],
  },
  {
    name: 'Badge/Tag element',
    category: 'complex',
    input: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: 'rgb(220, 252, 231)',
      color: 'rgb(21, 128, 61)',
      borderRadius: '9999px',
    },
    expectedClasses: [
      'inline-flex', 'items-center', 'py-0.5', 'px-2.5',
      'text-xs', 'font-medium', 'bg-green-100', 'text-green-700', 'rounded-full'
    ],
  },
  {
    name: 'Text truncation pattern',
    category: 'complex',
    input: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '200px',
    },
    expectedClasses: [
      'overflow-hidden', 'text-ellipsis', 'whitespace-nowrap', 'max-w-[200px]'
    ],
  },
];

// =============================================================================
// TEST RUNNER
// =============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  output: string;
  expected: string[];
  missing: string[];
  extra: string[];
  arbitraryCount: number;
  arbitraryExceeded: boolean;
}

function runTest(testCase: TestCase): TestResult {
  const result = cssToTailwind(testCase.input);

  const expectedClasses = testCase.expectedClasses || [];
  const missing = expectedClasses.filter(c => !result.classes.includes(c));
  const extra = result.classes.filter(c => !expectedClasses.includes(c));

  const arbitraryExceeded = testCase.expectedArbitraryMax !== undefined
    && result.arbitraryCount > testCase.expectedArbitraryMax;

  // Test passes if all expected classes are present (extra classes are ok)
  // and arbitrary count is within limits (if specified)
  const passed = missing.length === 0 && !arbitraryExceeded;

  return {
    name: testCase.name,
    passed,
    output: result.className,
    expected: expectedClasses,
    missing,
    extra,
    arbitraryCount: result.arbitraryCount,
    arbitraryExceeded,
  };
}

function runTests(): boolean {
  console.log('\n' + '='.repeat(70));
  console.log('CSS-to-Tailwind Converter Test Suite');
  console.log('='.repeat(70) + '\n');

  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;

  // Group tests by category
  const categories = [...new Set(testCases.map(t => t.category))];

  for (const category of categories) {
    console.log(`\n--- ${category.toUpperCase()} ---\n`);

    const categoryTests = testCases.filter(t => t.category === category);

    for (const testCase of categoryTests) {
      const result = runTest(testCase);
      results.push(result);

      if (result.passed) {
        passed++;
        console.log(`  ✓ ${result.name}`);
        console.log(`    → ${result.output}`);
      } else {
        failed++;
        console.log(`  ✗ ${result.name}`);
        console.log(`    Output:   ${result.output}`);
        if (result.expected.length > 0) {
          console.log(`    Expected: ${result.expected.join(' ')}`);
        }
        if (result.missing.length > 0) {
          console.log(`    Missing:  ${result.missing.join(', ')}`);
        }
        if (result.arbitraryExceeded) {
          console.log(`    Arbitrary count: ${result.arbitraryCount} (exceeded limit)`);
        }
      }
      console.log('');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n  Total:  ${testCases.length}`);
  console.log(`  Passed: ${passed} ✓`);
  console.log(`  Failed: ${failed} ✗`);
  console.log(`  Rate:   ${((passed / testCases.length) * 100).toFixed(1)}%`);

  // Category breakdown
  console.log('\n  By Category:');
  for (const category of categories) {
    const catResults = results.filter((_, i) => testCases[i].category === category);
    const catPassed = catResults.filter(r => r.passed).length;
    const status = catPassed === catResults.length ? '✓' : '✗';
    console.log(`    ${category}: ${catPassed}/${catResults.length} ${status}`);
  }

  console.log('\n' + '='.repeat(70) + '\n');

  return failed === 0;
}

// =============================================================================
// INTERACTIVE MODE - Test custom CSS
// =============================================================================

function testCustomCSS(css: CSSProperties): void {
  console.log('\n--- Custom CSS Test ---\n');
  console.log('Input:', JSON.stringify(css, null, 2));

  const result = cssToTailwind(css);

  console.log('\nOutput:');
  console.log('  Classes:', result.classes);
  console.log('  className:', result.className);
  console.log('  Arbitrary count:', result.arbitraryCount);
  if (result.unconverted.length > 0) {
    console.log('  Unconverted:', result.unconverted);
  }
  console.log('');
}

// =============================================================================
// CLI ENTRY POINT
// =============================================================================

// Check if running as main module (like Python's if __name__ == "__main__")
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  // Check for custom CSS via command line argument
  const customArg = process.argv[2];

  if (customArg === '--help' || customArg === '-h') {
    console.log(`
CSS-to-Tailwind Converter Test Harness

Usage:
  npx tsx src/lib/css-to-tailwind/test-harness.ts           Run all tests
  npx tsx src/lib/css-to-tailwind/test-harness.ts --custom  Run with custom CSS

Examples:
  npx tsx src/lib/css-to-tailwind/test-harness.ts
  npx tsx src/lib/css-to-tailwind/test-harness.ts --custom '{"padding":"16px","backgroundColor":"rgb(59,130,246)"}'
`);
    process.exit(0);
  }

  if (customArg === '--custom' && process.argv[3]) {
    try {
      const css = JSON.parse(process.argv[3]) as CSSProperties;
      testCustomCSS(css);
    } catch (e) {
      console.error('Error parsing custom CSS JSON:', e);
      process.exit(1);
    }
  } else {
    const success = runTests();
    process.exit(success ? 0 : 1);
  }
}

// Export for programmatic use
export { runTests, testCases, testCustomCSS };
