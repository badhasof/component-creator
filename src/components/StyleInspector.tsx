import { useState, useEffect } from 'react';

interface StyleInspectorProps {
  element: HTMLElement;
}

export function StyleInspector({ element }: StyleInspectorProps) {
  console.log('StyleInspector rendering with element:', element);
  const [activeTab, setActiveTab] = useState<'styling' | 'html' | 'react'>('react');
  const [reactViewTab, setReactViewTab] = useState<'code' | 'preview'>('preview');
  const [reactCode, setReactCode] = useState<string>('');

  let computedStyles: CSSStyleDeclaration;
  try {
    computedStyles = window.getComputedStyle(element);
  } catch (e) {
    console.error('Error getting computed styles:', e);
    return <div style={{ padding: '20px', color: 'red' }}>Error: Could not get element styles</div>;
  }

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

  // Convert HTML to React/JSX
  const convertHtmlToReact = (sourceElement: HTMLElement): string => {
    // Recursively process element and its children
    const processElement = (el: HTMLElement): string => {
      const tagName = el.tagName.toLowerCase();

      // Temporarily remove highlight class to get accurate computed styles
      const hadHighlight = el.classList.contains('cc-highlight-outline');
      if (hadHighlight) {
        el.classList.remove('cc-highlight-outline');
        // Force a reflow to ensure computed styles reflect the class removal
        void el.offsetHeight;
      }

      const computedStyle = window.getComputedStyle(el);

      // Restore highlight class after getting styles
      if (hadHighlight) {
        el.classList.add('cc-highlight-outline');
      }

      // Extract important style properties
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

      // Colors
      if (computedStyle.color && computedStyle.color !== 'rgb(0, 0, 0)') {
        inlineStyles.color = computedStyle.color;
      }
      if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        inlineStyles.backgroundColor = computedStyle.backgroundColor;
      }

      // Typography
      if (computedStyle.fontSize) inlineStyles.fontSize = computedStyle.fontSize;
      if (computedStyle.fontWeight && computedStyle.fontWeight !== '400') {
        inlineStyles.fontWeight = computedStyle.fontWeight;
      }
      if (computedStyle.fontFamily) inlineStyles.fontFamily = computedStyle.fontFamily;
      if (computedStyle.lineHeight && computedStyle.lineHeight !== 'normal') {
        inlineStyles.lineHeight = computedStyle.lineHeight;
      }
      if (computedStyle.letterSpacing && computedStyle.letterSpacing !== 'normal') {
        inlineStyles.letterSpacing = computedStyle.letterSpacing;
      }

      // Layout
      if (computedStyle.display && computedStyle.display !== 'inline') {
        inlineStyles.display = computedStyle.display;
      }
      if (computedStyle.flexDirection && computedStyle.flexDirection !== 'row') {
        inlineStyles.flexDirection = computedStyle.flexDirection;
      }
      if (computedStyle.alignItems && computedStyle.alignItems !== 'normal') {
        inlineStyles.alignItems = computedStyle.alignItems;
      }
      if (computedStyle.justifyContent && computedStyle.justifyContent !== 'normal') {
        inlineStyles.justifyContent = computedStyle.justifyContent;
      }
      if (computedStyle.gap && computedStyle.gap !== 'normal' && computedStyle.gap !== '0px') {
        inlineStyles.gap = computedStyle.gap;
      }

      // Spacing
      const padding = computedStyle.padding;
      if (padding && padding !== '0px') inlineStyles.padding = padding;
      const margin = computedStyle.margin;
      if (margin && margin !== '0px') inlineStyles.margin = margin;

      // Borders
      if (computedStyle.borderWidth && computedStyle.borderWidth !== '0px') {
        inlineStyles.borderWidth = computedStyle.borderWidth;
        if (computedStyle.borderStyle) inlineStyles.borderStyle = computedStyle.borderStyle;
        if (computedStyle.borderColor) inlineStyles.borderColor = computedStyle.borderColor;
      }
      if (computedStyle.borderRadius && computedStyle.borderRadius !== '0px') {
        inlineStyles.borderRadius = computedStyle.borderRadius;
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
        inlineStyles.position = computedStyle.position;
      }

      // Box shadow
      if (computedStyle.boxShadow && computedStyle.boxShadow !== 'none') {
        inlineStyles.boxShadow = computedStyle.boxShadow;
      }

      // Text decoration
      if (computedStyle.textDecoration && computedStyle.textDecoration !== 'none solid rgb(0, 0, 0)' && computedStyle.textDecoration !== 'none') {
        inlineStyles.textDecoration = computedStyle.textDecoration;
      }
      if (computedStyle.textDecorationLine && computedStyle.textDecorationLine !== 'none') {
        inlineStyles.textDecorationLine = computedStyle.textDecorationLine;
      }

      // Opacity
      if (computedStyle.opacity && computedStyle.opacity !== '1') {
        inlineStyles.opacity = computedStyle.opacity;
      }

      // Transform
      if (computedStyle.transform && computedStyle.transform !== 'none') {
        inlineStyles.transform = computedStyle.transform;
      }
      if (computedStyle.transformOrigin && computedStyle.transformOrigin !== '50% 50%' && computedStyle.transformOrigin !== '50% 50% 0px') {
        inlineStyles.transformOrigin = computedStyle.transformOrigin;
      }

      // Transition
      if (computedStyle.transition && computedStyle.transition !== 'all 0s ease 0s' && computedStyle.transition !== 'none') {
        inlineStyles.transition = computedStyle.transition;
      }

      // Background image / gradients
      if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
        inlineStyles.backgroundImage = computedStyle.backgroundImage;
      }
      if (computedStyle.backgroundSize && computedStyle.backgroundSize !== 'auto' && computedStyle.backgroundSize !== 'auto auto') {
        inlineStyles.backgroundSize = computedStyle.backgroundSize;
      }
      if (computedStyle.backgroundPosition && computedStyle.backgroundPosition !== '0% 0%') {
        inlineStyles.backgroundPosition = computedStyle.backgroundPosition;
      }
      if (computedStyle.backgroundRepeat && computedStyle.backgroundRepeat !== 'repeat') {
        inlineStyles.backgroundRepeat = computedStyle.backgroundRepeat;
      }

      // Grid properties
      if (computedStyle.display === 'grid' || computedStyle.display === 'inline-grid') {
        if (computedStyle.gridTemplateColumns && computedStyle.gridTemplateColumns !== 'none') {
          inlineStyles.gridTemplateColumns = computedStyle.gridTemplateColumns;
        }
        if (computedStyle.gridTemplateRows && computedStyle.gridTemplateRows !== 'none') {
          inlineStyles.gridTemplateRows = computedStyle.gridTemplateRows;
        }
        if (computedStyle.gridAutoColumns && computedStyle.gridAutoColumns !== 'auto') {
          inlineStyles.gridAutoColumns = computedStyle.gridAutoColumns;
        }
        if (computedStyle.gridAutoRows && computedStyle.gridAutoRows !== 'auto') {
          inlineStyles.gridAutoRows = computedStyle.gridAutoRows;
        }
        if (computedStyle.gridAutoFlow && computedStyle.gridAutoFlow !== 'row') {
          inlineStyles.gridAutoFlow = computedStyle.gridAutoFlow;
        }
      }
      // Grid item properties (can be on any element)
      if (computedStyle.gridColumn && computedStyle.gridColumn !== 'auto / auto') {
        inlineStyles.gridColumn = computedStyle.gridColumn;
      }
      if (computedStyle.gridRow && computedStyle.gridRow !== 'auto / auto') {
        inlineStyles.gridRow = computedStyle.gridRow;
      }
      if (computedStyle.gridArea && computedStyle.gridArea !== 'auto / auto / auto / auto') {
        inlineStyles.gridArea = computedStyle.gridArea;
      }

      // Flex item properties
      if (computedStyle.flexBasis && computedStyle.flexBasis !== 'auto') {
        inlineStyles.flexBasis = computedStyle.flexBasis;
      }
      if (computedStyle.flexGrow && computedStyle.flexGrow !== '0') {
        inlineStyles.flexGrow = computedStyle.flexGrow;
      }
      if (computedStyle.flexShrink && computedStyle.flexShrink !== '1') {
        inlineStyles.flexShrink = computedStyle.flexShrink;
      }
      if (computedStyle.flexWrap && computedStyle.flexWrap !== 'nowrap') {
        inlineStyles.flexWrap = computedStyle.flexWrap;
      }
      if (computedStyle.alignSelf && computedStyle.alignSelf !== 'auto') {
        inlineStyles.alignSelf = computedStyle.alignSelf;
      }
      if (computedStyle.justifySelf && computedStyle.justifySelf !== 'auto') {
        inlineStyles.justifySelf = computedStyle.justifySelf;
      }
      if (computedStyle.order && computedStyle.order !== '0') {
        inlineStyles.order = computedStyle.order;
      }

      // Z-index - skip our extension's highlight z-index (2147483646)
      if (computedStyle.zIndex && computedStyle.zIndex !== 'auto' && computedStyle.zIndex !== '2147483646') {
        inlineStyles.zIndex = computedStyle.zIndex;
      }

      // Text styling
      if (computedStyle.whiteSpace && computedStyle.whiteSpace !== 'normal') {
        inlineStyles.whiteSpace = computedStyle.whiteSpace;
      }
      if (computedStyle.textTransform && computedStyle.textTransform !== 'none') {
        inlineStyles.textTransform = computedStyle.textTransform;
      }
      if (computedStyle.textOverflow && computedStyle.textOverflow !== 'clip') {
        inlineStyles.textOverflow = computedStyle.textOverflow;
      }
      if (computedStyle.wordBreak && computedStyle.wordBreak !== 'normal') {
        inlineStyles.wordBreak = computedStyle.wordBreak;
      }
      if (computedStyle.textShadow && computedStyle.textShadow !== 'none') {
        inlineStyles.textShadow = computedStyle.textShadow;
      }

      // Visibility and display
      if (computedStyle.visibility && computedStyle.visibility !== 'visible') {
        inlineStyles.visibility = computedStyle.visibility;
      }

      // Position offsets (only when positioned)
      if (computedStyle.position && computedStyle.position !== 'static') {
        if (computedStyle.top && computedStyle.top !== 'auto') {
          inlineStyles.top = computedStyle.top;
        }
        if (computedStyle.right && computedStyle.right !== 'auto') {
          inlineStyles.right = computedStyle.right;
        }
        if (computedStyle.bottom && computedStyle.bottom !== 'auto') {
          inlineStyles.bottom = computedStyle.bottom;
        }
        if (computedStyle.left && computedStyle.left !== 'auto') {
          inlineStyles.left = computedStyle.left;
        }
      }

      // Max dimensions
      if (computedStyle.maxWidth && computedStyle.maxWidth !== 'none') {
        inlineStyles.maxWidth = computedStyle.maxWidth;
      }
      if (computedStyle.maxHeight && computedStyle.maxHeight !== 'none') {
        inlineStyles.maxHeight = computedStyle.maxHeight;
      }

      // Aspect ratio
      if (computedStyle.aspectRatio && computedStyle.aspectRatio !== 'auto') {
        inlineStyles.aspectRatio = computedStyle.aspectRatio;
      }

      // Object fit (for images/videos)
      if (computedStyle.objectFit && computedStyle.objectFit !== 'fill') {
        inlineStyles.objectFit = computedStyle.objectFit;
      }
      if (computedStyle.objectPosition && computedStyle.objectPosition !== '50% 50%') {
        inlineStyles.objectPosition = computedStyle.objectPosition;
      }

      // Outline - skip our extension's highlight outline (3px solid #3b82f6)
      if (computedStyle.outlineWidth && computedStyle.outlineWidth !== '0px') {
        const outlineColor = computedStyle.outlineColor;
        const outlineWidth = computedStyle.outlineWidth;
        const isExtensionOutline = outlineWidth === '3px' &&
          (outlineColor === 'rgb(59, 130, 246)' || outlineColor === '#3b82f6');
        if (!isExtensionOutline) {
          inlineStyles.outline = `${outlineWidth} ${computedStyle.outlineStyle} ${outlineColor}`;
        }
      }

      // Others
      if (computedStyle.overflow && computedStyle.overflow !== 'visible') {
        inlineStyles.overflow = computedStyle.overflow;
      }
      if (computedStyle.overflowX && computedStyle.overflowX !== 'visible' && computedStyle.overflowX !== computedStyle.overflow) {
        inlineStyles.overflowX = computedStyle.overflowX;
      }
      if (computedStyle.overflowY && computedStyle.overflowY !== 'visible' && computedStyle.overflowY !== computedStyle.overflow) {
        inlineStyles.overflowY = computedStyle.overflowY;
      }
      if (computedStyle.textAlign && computedStyle.textAlign !== 'start') {
        inlineStyles.textAlign = computedStyle.textAlign;
      }
      if (computedStyle.cursor && computedStyle.cursor !== 'auto') {
        inlineStyles.cursor = computedStyle.cursor;
      }
      if (computedStyle.pointerEvents && computedStyle.pointerEvents !== 'auto') {
        inlineStyles.pointerEvents = computedStyle.pointerEvents;
      }
      if (computedStyle.userSelect && computedStyle.userSelect !== 'auto') {
        inlineStyles.userSelect = computedStyle.userSelect;
      }

      // Build attributes
      let attributes = '';

      // Copy existing attributes (except style, filter cc- classes from class)
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        if (attr.name === 'style') continue;

        let attrName = attr.name;
        let attrValue = attr.value;

        // Convert to React attribute names
        if (attrName === 'for') attrName = 'htmlFor';
        if (attrName === 'class') {
          attrName = 'className';
          // Filter out cc- prefixed classes (our extension's classes)
          attrValue = attrValue.split(' ').filter(c => !c.startsWith('cc-')).join(' ');
          if (!attrValue.trim()) continue; // Skip if no classes left
        }

        // Convert xlink:href to xlinkHref for React
        if (attrName === 'xlink:href') attrName = 'xlinkHref';

        // Handle attributes with special characters (quotes, braces, etc.)
        // Use JSX expression syntax for these
        if (attrValue.includes('"') || attrValue.includes('{') || attrValue.includes('}')) {
          // Escape backticks and use template literal
          const escaped = attrValue.replace(/`/g, '\\`').replace(/\$/g, '\\$');
          attributes += ` ${attrName}={\`${escaped}\`}`;
        } else {
          attributes += ` ${attrName}="${attrValue}"`;
        }
      }

      // Add style attribute if we have inline styles
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
    try {
      const code = convertHtmlToReact(element);
      setReactCode(code);
    } catch (error) {
      console.error('Error converting HTML to React:', error);
      setReactCode('// Error generating component');
    }
  }, [element]);

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
          onClick={() => setActiveTab('react')}
          style={activeTab === 'react' ? activeTabStyles : tabStyles}
        >
          React
        </button>
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
      </div>

      {/* Tab Content */}
      <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
        {activeTab === 'react' && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
              React Component
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
                  {(() => {
                    try {
                      const sandboxUrl = chrome.runtime.getURL('sandbox.html');
                      return (
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
                          src={sandboxUrl}
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
                      );
                    } catch (e) {
                      console.error('Extension context error:', e);
                      return (
                        <div style={{ padding: '20px', color: '#6b7280', textAlign: 'center' }}>
                          Preview unavailable. Please refresh the page and try again.
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}
