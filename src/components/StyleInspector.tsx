import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface StyleInspectorProps {
  element: HTMLElement;
}

export function StyleInspector({ element }: StyleInspectorProps) {
  const [activeTab, setActiveTab] = useState<'styling' | 'html' | 'react' | 'code'>('styling');
  const [codeViewTab, setCodeViewTab] = useState<'code' | 'preview'>('code');
  const [reactViewTab, setReactViewTab] = useState<'code' | 'preview'>('code');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [reactCode, setReactCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<'gemini-2.5-flash' | 'gemini-2.5-flash-lite'>('gemini-2.5-flash');
  const computedStyles = window.getComputedStyle(element);

  // Extract all relevant CSS properties
  const getAllStyles = () => {
    const styles: Record<string, string> = {};
    for (let i = 0; i < computedStyles.length; i++) {
      const prop = computedStyles[i];
      const value = computedStyles.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
        styles[prop] = value;
      }
    }
    return styles;
  };

  const allStyles = getAllStyles();
  const htmlCode = element.outerHTML;

  // Helper: Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Helper: Convert RGB to closest Tailwind color
  const rgbToTailwind = (rgbString: string): string | null => {
    const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;

    const [, r, g, b] = match.map(Number);

    // Expanded Tailwind color palette with more shades
    const colors: Record<string, [number, number, number]> = {
      'white': [255, 255, 255],
      'gray-50': [249, 250, 251], // Very close to white
      'black': [0, 0, 0],
      'gray-100': [243, 244, 246],
      'gray-200': [229, 231, 235],
      'gray-300': [209, 213, 219],
      'gray-400': [156, 163, 175],
      'gray-500': [107, 114, 128],
      'gray-600': [75, 85, 99],
      'gray-700': [55, 65, 81],
      'gray-800': [31, 41, 55],
      'gray-900': [17, 24, 39],
      'red-400': [248, 113, 113],
      'red-500': [239, 68, 68],
      'red-600': [220, 38, 38],
      'orange-400': [251, 146, 60],
      'orange-500': [249, 115, 22],
      'amber-400': [251, 191, 36],
      'amber-500': [245, 158, 11],
      'yellow-300': [253, 224, 71],
      'yellow-400': [250, 204, 21],
      'yellow-500': [234, 179, 8],
      'lime-400': [163, 230, 53],
      'lime-500': [132, 204, 22],
      'lime-600': [101, 163, 13],
      'green-400': [74, 222, 128],
      'green-500': [34, 197, 94],
      'green-600': [22, 163, 74],
      'emerald-400': [52, 211, 153],
      'emerald-500': [16, 185, 129],
      'emerald-600': [5, 150, 105],
      'teal-400': [45, 212, 191],
      'teal-500': [20, 184, 166],
      'teal-600': [13, 148, 136],
      'cyan-400': [34, 211, 238],
      'cyan-500': [6, 182, 212],
      'sky-400': [56, 189, 248],
      'sky-500': [14, 165, 233],
      'blue-400': [96, 165, 250],
      'blue-500': [59, 130, 246],
      'blue-600': [37, 99, 235],
      'indigo-400': [129, 140, 248],
      'indigo-500': [99, 102, 241],
      'violet-400': [167, 139, 250],
      'violet-500': [139, 92, 246],
      'purple-400': [192, 132, 252],
      'purple-500': [168, 85, 247],
      'fuchsia-400': [232, 121, 249],
      'fuchsia-500': [217, 70, 239],
      'pink-400': [244, 114, 182],
      'pink-500': [236, 72, 153],
      'rose-400': [251, 113, 133],
      'rose-500': [244, 63, 94],
      // Add some olive/muted tones
      'stone-400': [168, 162, 158],
      'stone-500': [120, 113, 108],
      'stone-600': [87, 83, 78],
      'neutral-400': [163, 163, 163],
      'neutral-500': [115, 115, 115],
      'zinc-400': [161, 161, 170],
      'zinc-500': [113, 113, 122],
      'slate-400': [148, 163, 184],
      'slate-500': [100, 116, 139],
      // Olive/sage greens
      'lime-700': [77, 124, 15],
      'lime-800': [63, 98, 18],
      'green-700': [21, 128, 61],
      'green-800': [22, 101, 52],
      'emerald-700': [4, 120, 87],
    };

    // Find closest color
    let closestColor = null;
    let minDistance = Infinity;

    for (const [name, [cr, cg, cb]] of Object.entries(colors)) {
      const distance = Math.sqrt(
        Math.pow(r - cr, 2) +
        Math.pow(g - cg, 2) +
        Math.pow(b - cb, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = name;
      }
    }

    // Only use Tailwind color if it's very close (threshold: 30)
    // This ensures we only use Tailwind colors for exact or near-exact matches
    // Otherwise, we'll use hex which is more accurate
    if (closestColor && minDistance < 30) {
      return closestColor;
    }

    return null;
  };

  // Helper: Round fractional pixel values
  const roundPxValue = (pxValue: string): string => {
    const value = parseFloat(pxValue);
    // Round to nearest integer
    const rounded = Math.round(value);
    return `${rounded}px`;
  };

  // Helper: Convert px value to Tailwind spacing scale
  const pxToSpacing = (pxValue: string): string | null => {
    const value = parseFloat(pxValue);

    // Tailwind spacing scale: 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96
    // In px: 0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 256, 288, 320, 384
    const spacingMap: Record<number, string> = {
      0: '0',
      2: '0.5',
      4: '1',
      6: '1.5',
      8: '2',
      10: '2.5',
      12: '3',
      14: '3.5',
      16: '4',
      20: '5',
      24: '6',
      28: '7',
      32: '8',
      36: '9',
      40: '10',
      44: '11',
      48: '12',
      56: '14',
      64: '16',
      80: '20',
      96: '24',
      112: '28',
      128: '32',
      144: '36',
      160: '40',
      176: '44',
      192: '48',
      208: '52',
      224: '56',
      240: '60',
      256: '64',
      288: '72',
      320: '80',
      384: '96',
    };

    // Round the value first
    const rounded = Math.round(value);

    // Exact match
    if (spacingMap[rounded]) {
      return spacingMap[rounded];
    }

    // Find closest (within 2px tolerance)
    for (const [px, scale] of Object.entries(spacingMap)) {
      if (Math.abs(rounded - Number(px)) <= 2) {
        return scale;
      }
    }

    return null;
  };

  // Convert CSS value to Tailwind class
  const cssToTailwind = (property: string, value: string): string[] => {
    // Font size mapping
    if (property === 'fontSize') {
      const sizeMap: Record<string, string> = {
        '12px': 'text-xs',
        '14px': 'text-sm',
        '16px': 'text-base',
        '18px': 'text-lg',
        '20px': 'text-xl',
        '24px': 'text-2xl',
        '30px': 'text-3xl',
        '36px': 'text-4xl',
        '48px': 'text-5xl',
        '60px': 'text-6xl',
        '72px': 'text-7xl',
      };
      return [sizeMap[value] || `text-[${value}]`];
    }

    // Font weight mapping
    if (property === 'fontWeight') {
      const weightMap: Record<string, string> = {
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
      return [weightMap[value] || `font-[${value}]`];
    }

    // Display mapping
    if (property === 'display') {
      const displayMap: Record<string, string> = {
        'flex': 'flex',
        'inline-flex': 'inline-flex',
        'grid': 'grid',
        'inline-grid': 'inline-grid',
        'block': 'block',
        'inline-block': 'inline-block',
        'inline': 'inline',
        'none': 'hidden',
      };
      return [displayMap[value] || ''];
    }

    // Flex direction
    if (property === 'flexDirection') {
      const dirMap: Record<string, string> = {
        'row': 'flex-row',
        'row-reverse': 'flex-row-reverse',
        'column': 'flex-col',
        'column-reverse': 'flex-col-reverse',
      };
      return [dirMap[value] || ''];
    }

    // Align items
    if (property === 'alignItems') {
      const alignMap: Record<string, string> = {
        'flex-start': 'items-start',
        'center': 'items-center',
        'flex-end': 'items-end',
        'stretch': 'items-stretch',
        'baseline': 'items-baseline',
      };
      return [alignMap[value] || ''];
    }

    // Justify content
    if (property === 'justifyContent') {
      const justifyMap: Record<string, string> = {
        'flex-start': 'justify-start',
        'center': 'justify-center',
        'flex-end': 'justify-end',
        'space-between': 'justify-between',
        'space-around': 'justify-around',
        'space-evenly': 'justify-evenly',
      };
      return [justifyMap[value] || ''];
    }

    // Gap
    if (property === 'gap' && value !== 'normal' && value !== '0px') {
      // Try to map to Tailwind spacing first
      const spacing = pxToSpacing(value);
      if (spacing) {
        return [`gap-${spacing}`];
      }
      // Round fractional px values
      const rounded = value.includes('px') ? roundPxValue(value) : value;
      return [`gap-[${rounded}]`];
    }

    // Padding/Margin (simplified)
    if (property === 'padding' && value !== '0px') {
      return [`p-[${value}]`];
    }
    if (property === 'margin' && value !== '0px') {
      return [`m-[${value}]`];
    }

    // Border radius
    if (property === 'borderRadius' && value !== '0px') {
      const radiusMap: Record<string, string> = {
        '2px': 'rounded-sm',
        '4px': 'rounded',
        '6px': 'rounded-md',
        '8px': 'rounded-lg',
        '12px': 'rounded-xl',
        '16px': 'rounded-2xl',
        '24px': 'rounded-3xl',
        '9999px': 'rounded-full',
      };
      return [radiusMap[value] || `rounded-[${value}]`];
    }

    // Text align
    if (property === 'textAlign') {
      const alignMap: Record<string, string> = {
        'left': 'text-left',
        'center': 'text-center',
        'right': 'text-right',
        'justify': 'text-justify',
      };
      return [alignMap[value] || ''];
    }

    // Position
    if (property === 'position') {
      const posMap: Record<string, string> = {
        'relative': 'relative',
        'absolute': 'absolute',
        'fixed': 'fixed',
        'sticky': 'sticky',
      };
      return [posMap[value] || ''];
    }

    // Overflow
    if (property === 'overflow') {
      const overflowMap: Record<string, string> = {
        'hidden': 'overflow-hidden',
        'auto': 'overflow-auto',
        'scroll': 'overflow-scroll',
        'visible': 'overflow-visible',
      };
      return [overflowMap[value] || ''];
    }

    // Cursor
    if (property === 'cursor') {
      const cursorMap: Record<string, string> = {
        'pointer': 'cursor-pointer',
        'default': 'cursor-default',
        'text': 'cursor-text',
        'wait': 'cursor-wait',
        'move': 'cursor-move',
        'not-allowed': 'cursor-not-allowed',
        'help': 'cursor-help',
        'grab': 'cursor-grab',
        'grabbing': 'cursor-grabbing',
      };
      return [cursorMap[value] || `cursor-[${value}]`];
    }

    // Colors - try to use Tailwind colors first, fallback to hex
    if (property === 'color' && value !== 'rgb(0, 0, 0)') {
      const tailwindColor = rgbToTailwind(value);
      if (tailwindColor) {
        return [`text-${tailwindColor}`];
      }
      // Convert RGB to hex for better Tailwind arbitrary value support
      const rgbMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number);
        const hex = rgbToHex(r, g, b);
        return [`text-[${hex}]`];
      }
      return [`text-[${value}]`];
    }
    if (property === 'backgroundColor' && value !== 'rgba(0, 0, 0, 0)') {
      const tailwindColor = rgbToTailwind(value);
      if (tailwindColor) {
        return [`bg-${tailwindColor}`];
      }
      // Convert RGB to hex for better Tailwind arbitrary value support
      const rgbMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number);
        const hex = rgbToHex(r, g, b);
        return [`bg-[${hex}]`];
      }
      return [`bg-[${value}]`];
    }
    if (property === 'borderColor') {
      const tailwindColor = rgbToTailwind(value);
      if (tailwindColor) {
        return [`border-${tailwindColor}`];
      }
      // Convert RGB to hex for better Tailwind arbitrary value support
      const rgbMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number);
        const hex = rgbToHex(r, g, b);
        return [`border-[${hex}]`];
      }
      return [`border-[${value}]`];
    }

    // Border width
    if (property === 'borderWidth') {
      const borderMap: Record<string, string> = {
        '0px': 'border-0',
        '1px': 'border',
        '2px': 'border-2',
        '4px': 'border-4',
        '8px': 'border-8',
      };
      return [borderMap[value] || `border-[${value}]`];
    }

    // Border style
    if (property === 'borderStyle') {
      const styleMap: Record<string, string> = {
        'solid': 'border-solid',
        'dashed': 'border-dashed',
        'dotted': 'border-dotted',
        'double': 'border-double',
        'none': 'border-none',
      };
      return [styleMap[value] || ''];
    }

    // Width
    if (property === 'width') {
      const widthMap: Record<string, string> = {
        'auto': 'w-auto',
        '100%': 'w-full',
        '50%': 'w-1/2',
        '33.333333%': 'w-1/3',
        '25%': 'w-1/4',
      };
      if (widthMap[value]) {
        return [widthMap[value]];
      }
      // Round fractional px values
      const rounded = value.includes('px') ? roundPxValue(value) : value;
      return [`w-[${rounded}]`];
    }

    // Height
    if (property === 'height') {
      const heightMap: Record<string, string> = {
        'auto': 'h-auto',
        '100%': 'h-full',
        '100vh': 'h-screen',
      };
      if (heightMap[value]) {
        return [heightMap[value]];
      }
      // Round fractional px values
      const rounded = value.includes('px') ? roundPxValue(value) : value;
      return [`h-[${rounded}]`];
    }

    // Min width
    if (property === 'minWidth') {
      const rounded = value.includes('px') ? roundPxValue(value) : value;
      return [`min-w-[${rounded}]`];
    }

    // Min height
    if (property === 'minHeight') {
      const rounded = value.includes('px') ? roundPxValue(value) : value;
      return [`min-h-[${rounded}]`];
    }

    // Line height
    if (property === 'lineHeight') {
      const lineHeightMap: Record<string, string> = {
        '1': 'leading-none',
        '1.25': 'leading-tight',
        '1.375': 'leading-snug',
        '1.5': 'leading-normal',
        '1.625': 'leading-relaxed',
        '2': 'leading-loose',
      };
      return [lineHeightMap[value] || `leading-[${value}]`];
    }

    // Opacity
    if (property === 'opacity' && value !== '1') {
      const opacityValue = parseFloat(value) * 100;
      const opacityMap: Record<number, string> = {
        0: 'opacity-0',
        5: 'opacity-5',
        10: 'opacity-10',
        20: 'opacity-20',
        25: 'opacity-25',
        30: 'opacity-30',
        40: 'opacity-40',
        50: 'opacity-50',
        60: 'opacity-60',
        70: 'opacity-70',
        75: 'opacity-75',
        80: 'opacity-80',
        90: 'opacity-90',
        95: 'opacity-95',
        100: 'opacity-100',
      };
      // Find closest opacity value
      const closest = Object.keys(opacityMap).reduce((prev, curr) =>
        Math.abs(Number(curr) - opacityValue) < Math.abs(Number(prev) - opacityValue) ? curr : prev
      );
      return [opacityMap[Number(closest)]];
    }

    // Text decoration
    if (property === 'textDecoration' || property === 'textDecorationLine') {
      const decorationMap: Record<string, string> = {
        'underline': 'underline',
        'line-through': 'line-through',
        'none': 'no-underline',
      };
      return [decorationMap[value] || ''];
    }

    // Z-index
    if (property === 'zIndex' && value !== 'auto') {
      const zIndexMap: Record<string, string> = {
        '0': 'z-0',
        '10': 'z-10',
        '20': 'z-20',
        '30': 'z-30',
        '40': 'z-40',
        '50': 'z-50',
      };
      return [zIndexMap[value] || `z-[${value}]`];
    }

    return [];
  };

  // Convert HTML to React/JSX with Tailwind
  const convertHtmlToReact = (sourceElement: HTMLElement): string => {
    // Recursively process element and its children
    const processElement = (el: HTMLElement): string => {
      const tagName = el.tagName.toLowerCase();
      const computedStyle = window.getComputedStyle(el);

      // Collect Tailwind classes
      const tailwindClasses: string[] = [];
      const inlineStyles: Record<string, string> = {};

      // SVG-specific attributes
      const isSvgElement = el instanceof SVGElement;
      if (isSvgElement) {
        // SVG stroke and fill
        const stroke = el.getAttribute('stroke') || computedStyle.stroke;
        if (stroke && stroke !== 'none') inlineStyles.stroke = stroke;

        const fill = el.getAttribute('fill') || computedStyle.fill;
        if (fill && fill !== 'none') inlineStyles.fill = fill;

        const strokeWidth = el.getAttribute('stroke-width') || computedStyle.strokeWidth;
        if (strokeWidth && strokeWidth !== '0' && strokeWidth !== 'none') {
          inlineStyles.strokeWidth = strokeWidth;
        }

        const strokeLinecap = el.getAttribute('stroke-linecap') || computedStyle.strokeLinecap;
        if (strokeLinecap && strokeLinecap !== 'butt') {
          inlineStyles.strokeLinecap = strokeLinecap;
        }

        const strokeLinejoin = el.getAttribute('stroke-linejoin') || computedStyle.strokeLinejoin;
        if (strokeLinejoin && strokeLinejoin !== 'miter') {
          inlineStyles.strokeLinejoin = strokeLinejoin;
        }
      }

      // Typography
      if (computedStyle.fontSize) {
        const classes = cssToTailwind('fontSize', computedStyle.fontSize);
        tailwindClasses.push(...classes);
      }
      if (computedStyle.fontWeight && computedStyle.fontWeight !== '400') {
        const classes = cssToTailwind('fontWeight', computedStyle.fontWeight);
        tailwindClasses.push(...classes);
      }
      if (computedStyle.fontFamily) {
        // Only include font family if it's not a generic fallback
        const fontFamily = computedStyle.fontFamily.replace(/['"]/g, '');
        // Skip generic sans-serif, serif, monospace as these can be set via Tailwind
        if (fontFamily !== 'sans-serif' && fontFamily !== 'serif' && fontFamily !== 'monospace') {
          inlineStyles.fontFamily = fontFamily;
        }
      }
      if (computedStyle.lineHeight && computedStyle.lineHeight !== 'normal') {
        const classes = cssToTailwind('lineHeight', computedStyle.lineHeight);
        if (classes.length > 0) {
          tailwindClasses.push(...classes);
        } else {
          inlineStyles.lineHeight = computedStyle.lineHeight;
        }
      }
      if (computedStyle.letterSpacing && computedStyle.letterSpacing !== 'normal') {
        inlineStyles.letterSpacing = computedStyle.letterSpacing;
      }

      // Layout
      if (computedStyle.display && computedStyle.display !== 'inline') {
        const classes = cssToTailwind('display', computedStyle.display);
        tailwindClasses.push(...classes);
      }
      if (computedStyle.flexDirection && computedStyle.flexDirection !== 'row') {
        const classes = cssToTailwind('flexDirection', computedStyle.flexDirection);
        tailwindClasses.push(...classes);
      }
      if (computedStyle.alignItems && computedStyle.alignItems !== 'normal') {
        const classes = cssToTailwind('alignItems', computedStyle.alignItems);
        tailwindClasses.push(...classes);
      }
      if (computedStyle.justifyContent && computedStyle.justifyContent !== 'normal') {
        const classes = cssToTailwind('justifyContent', computedStyle.justifyContent);
        tailwindClasses.push(...classes);
      }
      if (computedStyle.gap && computedStyle.gap !== 'normal' && computedStyle.gap !== '0px') {
        const classes = cssToTailwind('gap', computedStyle.gap);
        tailwindClasses.push(...classes);
      }

      // Spacing - handle individual sides for better accuracy
      const pt = computedStyle.paddingTop;
      const pr = computedStyle.paddingRight;
      const pb = computedStyle.paddingBottom;
      const pl = computedStyle.paddingLeft;

      // Check if all padding sides are the same
      if (pt === pr && pr === pb && pb === pl && pt !== '0px') {
        // All sides same - use p-{value}
        const spacing = pxToSpacing(pt);
        tailwindClasses.push(spacing ? `p-${spacing}` : `p-[${pt}]`);
      } else {
        // Different sides - use individual classes
        if (pt && pt !== '0px') {
          const spacing = pxToSpacing(pt);
          tailwindClasses.push(spacing ? `pt-${spacing}` : `pt-[${pt}]`);
        }
        if (pr && pr !== '0px') {
          const spacing = pxToSpacing(pr);
          tailwindClasses.push(spacing ? `pr-${spacing}` : `pr-[${pr}]`);
        }
        if (pb && pb !== '0px') {
          const spacing = pxToSpacing(pb);
          tailwindClasses.push(spacing ? `pb-${spacing}` : `pb-[${pb}]`);
        }
        if (pl && pl !== '0px') {
          const spacing = pxToSpacing(pl);
          tailwindClasses.push(spacing ? `pl-${spacing}` : `pl-[${pl}]`);
        }
      }

      // Margin - handle individual sides
      const mt = computedStyle.marginTop;
      const mr = computedStyle.marginRight;
      const mb = computedStyle.marginBottom;
      const ml = computedStyle.marginLeft;

      // Check if all margin sides are the same
      if (mt === mr && mr === mb && mb === ml && mt !== '0px' && mt !== 'auto') {
        // All sides same - use m-{value}
        const spacing = pxToSpacing(mt);
        tailwindClasses.push(spacing ? `m-${spacing}` : `m-[${mt}]`);
      } else {
        // Different sides - use individual classes
        if (mt && mt !== '0px' && mt !== 'auto') {
          const spacing = pxToSpacing(mt);
          tailwindClasses.push(spacing ? `mt-${spacing}` : `mt-[${mt}]`);
        }
        if (mr && mr !== '0px' && mr !== 'auto') {
          const spacing = pxToSpacing(mr);
          tailwindClasses.push(spacing ? `mr-${spacing}` : `mr-[${mr}]`);
        }
        if (mb && mb !== '0px' && mb !== 'auto') {
          const spacing = pxToSpacing(mb);
          tailwindClasses.push(spacing ? `mb-${spacing}` : `mb-[${mb}]`);
        }
        if (ml && ml !== '0px' && ml !== 'auto') {
          const spacing = pxToSpacing(ml);
          tailwindClasses.push(spacing ? `ml-${spacing}` : `ml-[${ml}]`);
        }
      }

      // Borders - check individual sides to handle complex border values
      const borderTopWidth = computedStyle.borderTopWidth;
      const borderRightWidth = computedStyle.borderRightWidth;
      const borderBottomWidth = computedStyle.borderBottomWidth;
      const borderLeftWidth = computedStyle.borderLeftWidth;

      // Check if any border exists
      const hasBorder = (borderTopWidth && borderTopWidth !== '0px') ||
                        (borderRightWidth && borderRightWidth !== '0px') ||
                        (borderBottomWidth && borderBottomWidth !== '0px') ||
                        (borderLeftWidth && borderLeftWidth !== '0px');

      // Check if all sides have the same border width
      const allSidesSame = borderTopWidth === borderRightWidth &&
                           borderRightWidth === borderBottomWidth &&
                           borderBottomWidth === borderLeftWidth;

      if (hasBorder) {
        if (allSidesSame && borderTopWidth && borderTopWidth !== '0px') {
          // All sides have the same border width
          const classes = cssToTailwind('borderWidth', borderTopWidth);
          tailwindClasses.push(...classes);
        } else {
          // Different border widths on different sides - use arbitrary value for now
          if (borderTopWidth && borderTopWidth !== '0px') {
            tailwindClasses.push(`border-t-[${borderTopWidth}]`);
          }
          if (borderRightWidth && borderRightWidth !== '0px') {
            tailwindClasses.push(`border-r-[${borderRightWidth}]`);
          }
          if (borderBottomWidth && borderBottomWidth !== '0px') {
            tailwindClasses.push(`border-b-[${borderBottomWidth}]`);
          }
          if (borderLeftWidth && borderLeftWidth !== '0px') {
            tailwindClasses.push(`border-l-[${borderLeftWidth}]`);
          }
        }

        // Only add border style if there's actually a border
        if (computedStyle.borderStyle && computedStyle.borderStyle !== 'none') {
          const classes = cssToTailwind('borderStyle', computedStyle.borderStyle);
          tailwindClasses.push(...classes);
        }

        // Only add border color if there's actually a border
        if (computedStyle.borderColor) {
          const classes = cssToTailwind('borderColor', computedStyle.borderColor);
          tailwindClasses.push(...classes);
        }
      }

      // Border radius
      if (computedStyle.borderRadius && computedStyle.borderRadius !== '0px') {
        const classes = cssToTailwind('borderRadius', computedStyle.borderRadius);
        tailwindClasses.push(...classes);
      }

      // Colors - be more lenient with color detection
      // Only skip truly default colors (pure black for text, transparent for background)
      const textColor = computedStyle.color;
      const bgColor = computedStyle.backgroundColor;

      // Include text color if it's not the default black
      // Also include white/light colors explicitly
      if (textColor && textColor !== 'rgb(0, 0, 0)' && textColor !== 'rgba(0, 0, 0, 1)') {
        const classes = cssToTailwind('color', textColor);
        if (classes.length > 0 && classes[0]) {
          tailwindClasses.push(...classes);
        }
      }

      // Include background color if it's not transparent
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        const classes = cssToTailwind('backgroundColor', bgColor);
        tailwindClasses.push(...classes);
      }

      // Dimensions
      if (computedStyle.width && !computedStyle.width.includes('auto')) {
        const classes = cssToTailwind('width', computedStyle.width);
        tailwindClasses.push(...classes);
      }
      if (computedStyle.height && !computedStyle.height.includes('auto')) {
        const classes = cssToTailwind('height', computedStyle.height);
        tailwindClasses.push(...classes);
      }
      if (computedStyle.minWidth && computedStyle.minWidth !== '0px' && computedStyle.minWidth !== 'auto') {
        const classes = cssToTailwind('minWidth', computedStyle.minWidth);
        tailwindClasses.push(...classes);
      }
      if (computedStyle.minHeight && computedStyle.minHeight !== '0px' && computedStyle.minHeight !== 'auto') {
        const classes = cssToTailwind('minHeight', computedStyle.minHeight);
        tailwindClasses.push(...classes);
      }

      // Position
      if (computedStyle.position && computedStyle.position !== 'static') {
        const classes = cssToTailwind('position', computedStyle.position);
        tailwindClasses.push(...classes);
      }

      // Others
      if (computedStyle.overflow && computedStyle.overflow !== 'visible') {
        const classes = cssToTailwind('overflow', computedStyle.overflow);
        tailwindClasses.push(...classes);
      }
      if (computedStyle.textAlign && computedStyle.textAlign !== 'start') {
        const classes = cssToTailwind('textAlign', computedStyle.textAlign);
        tailwindClasses.push(...classes);
      }
      if (computedStyle.cursor && computedStyle.cursor !== 'auto' && computedStyle.cursor !== 'default') {
        // Skip cursor: pointer on elements that naturally have it (links, buttons)
        // Also skip cursor on generic divs/spans unless it's unusual
        const skipPointerOn = ['a', 'button', 'input', 'select', 'textarea'];
        const genericElements = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

        const shouldSkip = (computedStyle.cursor === 'pointer' && skipPointerOn.includes(tagName)) ||
                          (computedStyle.cursor === 'pointer' && genericElements.includes(tagName));

        if (!shouldSkip) {
          const classes = cssToTailwind('cursor', computedStyle.cursor);
          tailwindClasses.push(...classes);
        }
      }

      // Opacity
      if (computedStyle.opacity && computedStyle.opacity !== '1') {
        const classes = cssToTailwind('opacity', computedStyle.opacity);
        tailwindClasses.push(...classes);
      }

      // Text decoration - only add if it's actually decorated (not none)
      const textDecorationLine = computedStyle.textDecorationLine || computedStyle.textDecoration;
      if (textDecorationLine &&
          textDecorationLine !== 'none' &&
          textDecorationLine !== 'none solid rgb(0, 0, 0)' &&
          !textDecorationLine.startsWith('none ')) {
        const classes = cssToTailwind('textDecorationLine', textDecorationLine);
        if (classes.length > 0 && classes[0] !== '') {
          tailwindClasses.push(...classes);
        }
      }

      // Z-index
      if (computedStyle.zIndex && computedStyle.zIndex !== 'auto') {
        const classes = cssToTailwind('zIndex', computedStyle.zIndex);
        tailwindClasses.push(...classes);
      }

      // Box shadow - keep as inline style for now (complex to map to Tailwind)
      if (computedStyle.boxShadow && computedStyle.boxShadow !== 'none') {
        inlineStyles.boxShadow = computedStyle.boxShadow;
      }

      // Transform - keep as inline style (complex to map to Tailwind)
      if (computedStyle.transform && computedStyle.transform !== 'none') {
        inlineStyles.transform = computedStyle.transform;
      }

      // Build attributes
      let attributes = '';

      // Copy existing attributes (except class and style)
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        if (attr.name === 'class' || attr.name === 'style') continue;

        let attrName = attr.name;

        // Convert to React attribute names
        if (attrName === 'for') {
          attrName = 'htmlFor';
        }
        // Convert SVG attributes to camelCase
        else if (attrName === 'stroke-width') {
          attrName = 'strokeWidth';
        }
        else if (attrName === 'stroke-linecap') {
          attrName = 'strokeLinecap';
        }
        else if (attrName === 'stroke-linejoin') {
          attrName = 'strokeLinejoin';
        }
        else if (attrName === 'stroke-miterlimit') {
          attrName = 'strokeMiterlimit';
        }
        else if (attrName === 'stroke-dasharray') {
          attrName = 'strokeDasharray';
        }
        else if (attrName === 'stroke-dashoffset') {
          attrName = 'strokeDashoffset';
        }
        else if (attrName === 'fill-opacity') {
          attrName = 'fillOpacity';
        }
        else if (attrName === 'stroke-opacity') {
          attrName = 'strokeOpacity';
        }
        else if (attrName === 'fill-rule') {
          attrName = 'fillRule';
        }
        else if (attrName === 'clip-rule') {
          attrName = 'clipRule';
        }
        else if (attrName === 'clip-path') {
          attrName = 'clipPath';
        }

        // Convert relative URLs to absolute URLs for images and links
        let attrValue = attr.value;
        if ((attrName === 'src' || attrName === 'href') && attrValue) {
          try {
            // If it's a relative URL, convert to absolute using the page's base URL
            const absoluteUrl = new URL(attrValue, window.location.href);
            attrValue = absoluteUrl.href;
          } catch (e) {
            // If URL construction fails, keep original value (might be data URL, etc.)
            attrValue = attr.value;
          }
        }

        // Handle srcset attribute (contains multiple URLs)
        if (attrName === 'srcset' && attrValue) {
          try {
            // srcset format: "url1 1x, url2 2x" or "url1 100w, url2 200w"
            attrValue = attrValue.split(',').map((item: string) => {
              const parts = item.trim().split(/\s+/);
              if (parts.length >= 1) {
                try {
                  const absoluteUrl = new URL(parts[0], window.location.href);
                  parts[0] = absoluteUrl.href;
                } catch {
                  // Keep original if conversion fails
                }
              }
              return parts.join(' ');
            }).join(', ');
          } catch {
            // Keep original if parsing fails
            attrValue = attr.value;
          }
        }

        attributes += ` ${attrName}="${attrValue}"`;
      }

      // Add className attribute if we have Tailwind classes
      if (tailwindClasses.length > 0) {
        const classString = tailwindClasses.filter(c => c).join(' ');
        if (classString) {
          attributes += ` className="${classString}"`;
        }
      }

      // Add style attribute if we have inline styles (for things we couldn't convert to Tailwind)
      if (Object.keys(inlineStyles).length > 0) {
        // Convert relative URLs in background-image to absolute
        if (inlineStyles.backgroundImage) {
          try {
            inlineStyles.backgroundImage = inlineStyles.backgroundImage.replace(
              /url\(['"]?([^'"()]+)['"]?\)/g,
              (match: string, url: string) => {
                try {
                  const absoluteUrl = new URL(url, window.location.href);
                  return `url('${absoluteUrl.href}')`;
                } catch {
                  return match;
                }
              }
            );
          } catch {
            // Keep original if conversion fails
          }
        }

        const styleString = JSON.stringify(inlineStyles, null, 2)
          .replace(/"([^"]+)":/g, '$1:')  // Remove quotes from keys
          .replace(/\\'/g, "'")  // Remove escaped single quotes
          .replace(/"/g, "'");  // Replace double quotes with single quotes
        attributes += ` style={${styleString}}`;
      }

      // Skip elements that shouldn't be in React components
      const excludedTags = ['style', 'script', 'noscript', 'iframe', 'object', 'embed'];
      if (excludedTags.includes(tagName)) {
        return ''; // Don't include these elements
      }

      // Helper: Check if element is a simple text-only span
      const isSimpleTextSpan = (element: HTMLElement): boolean => {
        return element.tagName.toLowerCase() === 'span' &&
               element.childNodes.length === 1 &&
               element.childNodes[0].nodeType === Node.TEXT_NODE;
      };

      // Helper: Get text content from simple span
      const getSpanText = (element: HTMLElement): string => {
        return element.textContent || '';
      };

      // Process children with consolidation for letter-by-letter spans
      let children = '';
      if (el.childNodes.length > 0) {
        let i = 0;
        while (i < el.childNodes.length) {
          const child = el.childNodes[i];

          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            if (text) children += text;
            i++;
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const childEl = child as HTMLElement;

            // Check if this is a sequence of simple text spans (letter-by-letter text)
            if (isSimpleTextSpan(childEl)) {
              let consolidatedText = getSpanText(childEl);
              let j = i + 1;

              // Look ahead to find consecutive simple text spans with similar styling
              while (j < el.childNodes.length) {
                const nextChild = el.childNodes[j];
                if (nextChild.nodeType === Node.ELEMENT_NODE) {
                  const nextEl = nextChild as HTMLElement;
                  if (isSimpleTextSpan(nextEl)) {
                    consolidatedText += getSpanText(nextEl);
                    j++;
                  } else {
                    break;
                  }
                } else {
                  break;
                }
              }

              // If we consolidated multiple spans (letter-by-letter text)
              if (j > i + 1) {
                // Get the text color from the first span to preserve styling
                const firstSpanStyle = window.getComputedStyle(childEl);
                const spanTextColor = firstSpanStyle.color;

                // Check if the text has a specific color (not default/inherited)
                if (spanTextColor && spanTextColor !== 'rgb(0, 0, 0)' && spanTextColor !== 'rgba(0, 0, 0, 1)') {
                  // Wrap in a span with the color class
                  const colorClass = cssToTailwind('color', spanTextColor);
                  if (colorClass.length > 0 && colorClass[0]) {
                    children += `<span className="${colorClass[0]}">${consolidatedText}</span>`;
                  } else {
                    children += consolidatedText;
                  }
                } else {
                  children += consolidatedText;
                }
                i = j;
              } else {
                // Single span, process normally
                children += processElement(childEl);
                i++;
              }
            } else {
              children += processElement(childEl);
              i++;
            }
          } else {
            i++;
          }
        }
      }

      // Self-closing tags
      const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
      if (selfClosingTags.includes(tagName)) {
        return `<${tagName}${attributes} />`;
      }

      return `<${tagName}${attributes}>${children}</${tagName}>`;
    };

    const jsxContent = processElement(sourceElement);

    // Wrap in component structure
    const componentName = 'ConvertedComponent';
    const wrappedCode = `"use client";

import React from 'react';

interface ${componentName}Props {
  className?: string;
}

const ${componentName} = ({ className }: ${componentName}Props) => {
  return (
    ${jsxContent}
  );
};

export default ${componentName};`;

    return wrappedCode;
  };

  // Auto-generate React code when component mounts or element changes
  useEffect(() => {
    const code = convertHtmlToReact(element);
    setReactCode(code);
  }, [element]);

  // Generate code using Gemini API
  const generateCode = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: selectedModel,
      });

      const prompt = `
You are an expert React/Next.js developer. Your task is to convert this HTML element into a React component while preserving EVERYTHING exactly as it is.

## HTML Structure:
\`\`\`html
${htmlCode}
\`\`\`

## Computed CSS Styles:
\`\`\`css
${Object.entries(allStyles)
  .map(([prop, value]) => `${prop}: ${value};`)
  .join('\n')}
\`\`\`

## PRIMARY RULE - PRESERVE EVERYTHING:
**DO NOT CHANGE ANYTHING FROM THE ORIGINAL:**
- Keep ALL text content exactly as it appears (do not modify, improve, or change any text)
- Keep ALL class names exactly as they are
- Keep ALL attribute values exactly as they are
- Keep ALL image sources exactly as provided
- Keep ALL data attributes, aria labels, and other attributes unchanged
- Keep the EXACT structure and hierarchy of elements
- Your ONLY job is to convert HTML syntax to React/JSX syntax - nothing more

## Requirements - CRITICAL:
- Create a React functional component with TypeScript
- **PRIORITIZE Tailwind CSS over inline styles** - use the closest Tailwind equivalent for every style
- Only use inline styles for truly unique values that cannot be represented with Tailwind utilities
- Use modern React best practices
- Make text content and dynamic values into props (but keep default values identical to original)
- Include proper TypeScript interfaces for all props
- Add 'use client' directive if the component uses hooks or event handlers

## Tailwind Styling Rules - VERY IMPORTANT:
- **Use Tailwind classes for ALL styling whenever possible** - this is your PRIMARY goal
- For dimensions, colors, spacing, typography: ALWAYS use the closest Tailwind utility (e.g., \`w-48\` instead of \`width: "196px"\`)
- For layout properties (flex, grid, positioning): ALWAYS use Tailwind classes (e.g., \`flex items-center justify-center\`)
- For borders, shadows, opacity: ALWAYS use Tailwind utilities
- **DO NOT dump all computed styles as inline styles** - this creates bloated, unmaintainable code
- Only add inline styles for:
  1. Very specific pixel values that are critical to preserve exactly
  2. Complex gradients or transforms that don't have Tailwind equivalents
  3. CSS variables that are part of a design system
- When you see standard values like padding/margin/width/height, use Tailwind's spacing scale (e.g., \`p-4\`, \`m-2\`, \`w-24\`)
- For colors, use Tailwind's color palette or the closest equivalent
- **Remember: Clean, maintainable Tailwind code is better than pixel-perfect inline bloat**

## Code Quality Requirements:
- Only use valid Tailwind utility classes (check Tailwind documentation)
- For custom CSS variables or unique values, add them as comments at the top noting they should be in tailwind.config
- For SVGs, always include explicit stroke and fill colors (e.g., stroke="currentColor" or stroke="#100D0D")
- Never use invalid Tailwind classes like "justify-left" - use "justify-start" or "justify-center" instead
- Ensure all Tailwind breakpoint prefixes are valid (sm:, md:, lg:, xl:, 2xl:)
- Add brief comments for any custom CSS variables or font families used

## Output Format:
Return ONLY the component code wrapped in a markdown code block with the language specified (tsx, jsx, etc).

Generate the complete React component:
      `.trim();

      const result = await model.generateContent(prompt);
      const response = result.response;
      const generatedText = response.text();

      // Extract code from markdown code blocks
      const codeBlockRegex = /\`\`\`(?:jsx?|tsx?|typescript|javascript)?\n?([\s\S]*?)\`\`\`/g;
      const matches = [];
      let match;

      while ((match = codeBlockRegex.exec(generatedText)) !== null) {
        matches.push(match[1].trim());
      }

      const code = matches.length > 0 ? matches[0] : generatedText;
      setGeneratedCode(code);
    } catch (err: any) {
      setError(err.message || 'Failed to generate code');
      console.error('Gemini API Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const tabStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  };

  const activeTabStyles: React.CSSProperties = {
    ...tabStyles,
    color: '#3b82f6',
    borderBottom: '2px solid #3b82f6',
  };

  return (
    <div style={{
      width: '600px',
      maxHeight: '500px',
      background: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Tabs Header */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb',
      }}>
        <button
          onClick={() => setActiveTab('styling')}
          style={activeTab === 'styling' ? activeTabStyles : tabStyles}
        >
          Styling
        </button>
        <button
          onClick={() => setActiveTab('html')}
          style={activeTab === 'html' ? activeTabStyles : tabStyles}
        >
          HTML
        </button>
        <button
          onClick={() => setActiveTab('react')}
          style={activeTab === 'react' ? activeTabStyles : tabStyles}
        >
          React
        </button>
        <button
          onClick={() => setActiveTab('code')}
          style={activeTab === 'code' ? activeTabStyles : tabStyles}
        >
          Code Generation
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
        {activeTab === 'styling' && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
              Computed Styles
            </h3>
            <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              {Object.entries(allStyles).map(([prop, value]) => (
                <div
                  key={prop}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f3f4f6',
                    padding: '4px 0',
                  }}
                >
                  <span style={{ color: '#3b82f6', fontWeight: '500' }}>{prop}:</span>
                  <span style={{ color: '#4b5563', marginLeft: '8px', wordBreak: 'break-all' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'html' && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
              HTML
            </h3>
            <pre style={{
              background: '#f9fafb',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '12px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              color: '#374151',
            }}>
              <code>{htmlCode}</code>
            </pre>
          </div>
        )}

        {activeTab === 'react' && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
              React Component (Auto-converted)
            </h3>

            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                {/* Code/Preview Toggle Tabs */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setReactViewTab('code')}
                    style={{
                      padding: '4px 12px',
                      background: reactViewTab === 'code' ? '#3b82f6' : '#e5e7eb',
                      color: reactViewTab === 'code' ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Code
                  </button>
                  <button
                    onClick={() => setReactViewTab('preview')}
                    style={{
                      padding: '4px 12px',
                      background: reactViewTab === 'preview' ? '#3b82f6' : '#e5e7eb',
                      color: reactViewTab === 'preview' ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Preview
                  </button>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(reactCode);
                  }}
                  style={{
                    padding: '4px 8px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Copy
                </button>
              </div>

              {/* Code View */}
              {reactViewTab === 'code' && (
                <pre style={{
                  background: '#1f2937',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  color: '#e5e7eb',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}>
                  <code>{reactCode}</code>
                </pre>
              )}

              {/* Preview View */}
              {reactViewTab === 'preview' && (
                <div style={{
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '16px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  overflowX: 'auto',
                  width: '100%',
                }}>
                  <iframe
                    ref={(iframe) => {
                      if (iframe && reactCode) {
                        console.log('Setting up iframe for React preview');
                        const handleMessage = (event: MessageEvent) => {
                          console.log('Received message in parent:', event.data);
                          if (event.data.type === 'SANDBOX_READY' && iframe.contentWindow) {
                            console.log('Sandbox ready, sending React code to render');
                            iframe.contentWindow.postMessage({
                              type: 'RENDER_COMPONENT',
                              code: reactCode
                            }, '*');
                            window.removeEventListener('message', handleMessage);
                          }
                        };
                        window.addEventListener('message', handleMessage);
                      }
                    }}
                    src={chrome.runtime.getURL('sandbox.html')}
                    style={{
                      width: '100%',
                      minWidth: '100%',
                      height: '250px',
                      border: 'none',
                      borderRadius: '4px',
                      background: 'white',
                      display: 'block',
                    }}
                    sandbox="allow-scripts"
                    title="React Component Preview"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
              React + Tailwind Code
            </h3>

            {/* Model Selection Dropdown */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                display: 'block',
                marginBottom: '6px'
              }}>
                AI Model:
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as 'gemini-2.5-flash' | 'gemini-2.5-flash-lite')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: 'white',
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite (Faster)</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCode}
              disabled={isGenerating}
              style={{
                width: '100%',
                padding: '10px 16px',
                marginBottom: '16px',
                background: isGenerating ? '#9ca3af' : 'linear-gradient(to right, #8b5cf6, #ec4899)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {isGenerating ? 'Generating Code...' : 'Generate Code with AI'}
            </button>

            {/* Error Display */}
            {error && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                background: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '12px',
              }}>
                {error}
              </div>
            )}

            {/* Generated Code Display */}
            {generatedCode ? (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}>
                  {/* Code/Preview Toggle Tabs */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setCodeViewTab('code')}
                      style={{
                        padding: '4px 12px',
                        background: codeViewTab === 'code' ? '#3b82f6' : '#e5e7eb',
                        color: codeViewTab === 'code' ? 'white' : '#6b7280',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      Code
                    </button>
                    <button
                      onClick={() => setCodeViewTab('preview')}
                      style={{
                        padding: '4px 12px',
                        background: codeViewTab === 'preview' ? '#3b82f6' : '#e5e7eb',
                        color: codeViewTab === 'preview' ? 'white' : '#6b7280',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      Preview
                    </button>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                    }}
                    style={{
                      padding: '4px 8px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    Copy
                  </button>
                </div>

                {/* Code View */}
                {codeViewTab === 'code' && (
                  <pre style={{
                    background: '#1f2937',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: '#e5e7eb',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}>
                    <code>{generatedCode}</code>
                  </pre>
                )}

                {/* Preview View */}
                {codeViewTab === 'preview' && (
                  <div style={{
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '16px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    overflowX: 'auto',
                    width: '100%',
                  }}>
                    <iframe
                      ref={(iframe) => {
                        if (iframe && generatedCode) {
                          console.log('Setting up iframe for preview');
                          // Wait for sandbox to be ready
                          const handleMessage = (event: MessageEvent) => {
                            console.log('Received message in parent:', event.data);
                            if (event.data.type === 'SANDBOX_READY' && iframe.contentWindow) {
                              console.log('Sandbox ready, sending code to render');
                              // Send code to sandbox
                              iframe.contentWindow.postMessage({
                                type: 'RENDER_COMPONENT',
                                code: generatedCode
                              }, '*');
                              window.removeEventListener('message', handleMessage);
                            }
                          };
                          window.addEventListener('message', handleMessage);
                        }
                      }}
                      src={chrome.runtime.getURL('sandbox.html')}
                      style={{
                        width: '100%',
                        minWidth: '100%',
                        height: '250px',
                        border: 'none',
                        borderRadius: '4px',
                        background: 'white',
                        display: 'block',
                      }}
                      sandbox="allow-scripts"
                      title="Component Preview"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: '#f9fafb',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#6b7280',
                textAlign: 'center',
              }}>
                Click the button above to generate a React component from this element
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
