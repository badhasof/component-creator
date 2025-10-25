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

    // Gap (simplified - using arbitrary values)
    if (property === 'gap' && value !== 'normal' && value !== '0px') {
      return [`gap-[${value}]`];
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
      return [`cursor-[${value}]`];
    }

    // Colors (use arbitrary values for now)
    if (property === 'color' && value !== 'rgb(0, 0, 0)') {
      return [`text-[${value}]`];
    }
    if (property === 'backgroundColor' && value !== 'rgba(0, 0, 0, 0)') {
      return [`bg-[${value}]`];
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
        inlineStyles.fontFamily = computedStyle.fontFamily;
      }
      if (computedStyle.lineHeight && computedStyle.lineHeight !== 'normal') {
        inlineStyles.lineHeight = computedStyle.lineHeight;
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

      // Spacing
      const padding = computedStyle.padding;
      if (padding && padding !== '0px') {
        const classes = cssToTailwind('padding', padding);
        tailwindClasses.push(...classes);
      }
      const margin = computedStyle.margin;
      if (margin && margin !== '0px') {
        const classes = cssToTailwind('margin', margin);
        tailwindClasses.push(...classes);
      }

      // Borders
      if (computedStyle.borderWidth && computedStyle.borderWidth !== '0px') {
        inlineStyles.borderWidth = computedStyle.borderWidth;
        if (computedStyle.borderStyle) inlineStyles.borderStyle = computedStyle.borderStyle;
        if (computedStyle.borderColor) inlineStyles.borderColor = computedStyle.borderColor;
      }
      if (computedStyle.borderRadius && computedStyle.borderRadius !== '0px') {
        const classes = cssToTailwind('borderRadius', computedStyle.borderRadius);
        tailwindClasses.push(...classes);
      }

      // Colors
      if (computedStyle.color && computedStyle.color !== 'rgb(0, 0, 0)') {
        const classes = cssToTailwind('color', computedStyle.color);
        tailwindClasses.push(...classes);
      }
      if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const classes = cssToTailwind('backgroundColor', computedStyle.backgroundColor);
        tailwindClasses.push(...classes);
      }

      // Dimensions
      if (computedStyle.width && !computedStyle.width.includes('auto')) {
        inlineStyles.width = computedStyle.width;
      }
      if (computedStyle.height && !computedStyle.height.includes('auto')) {
        inlineStyles.height = computedStyle.height;
      }
      if (computedStyle.minWidth && computedStyle.minWidth !== '0px') {
        inlineStyles.minWidth = computedStyle.minWidth;
      }
      if (computedStyle.minHeight && computedStyle.minHeight !== '0px') {
        inlineStyles.minHeight = computedStyle.minHeight;
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
      if (computedStyle.cursor && computedStyle.cursor !== 'auto') {
        const classes = cssToTailwind('cursor', computedStyle.cursor);
        tailwindClasses.push(...classes);
      }

      // Build attributes
      let attributes = '';

      // Copy existing attributes (except class and style)
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        if (attr.name === 'class' || attr.name === 'style') continue;

        let attrName = attr.name;
        // Convert to React attribute names
        if (attrName === 'for') attrName = 'htmlFor';

        attributes += ` ${attrName}="${attr.value}"`;
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
        const styleString = JSON.stringify(inlineStyles, null, 2)
          .replace(/"([^"]+)":/g, '$1:')
          .replace(/"/g, "'");
        attributes += ` style={${styleString}}`;
      }

      // Process children
      let children = '';
      if (el.childNodes.length > 0) {
        el.childNodes.forEach(child => {
          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            if (text) children += text;
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            children += processElement(child as HTMLElement);
          }
        });
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
