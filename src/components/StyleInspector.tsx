import { useState, useEffect } from 'react';
import { extractAuthoredStyles } from '../lib/authored-styles';
import { parsePageStylesheets } from '../lib/authored-styles/css-parser';

interface StyleInspectorProps {
  element: HTMLElement;
}

interface ExtractionResult {
  html: string;
  customCSS: string;
  tailwindClasses: string[];
  customClasses: string[];
}

export function StyleInspector({ element }: StyleInspectorProps) {
  console.log('StyleInspector rendering with element:', element);
  const [activeTab, setActiveTab] = useState<'html' | 'react'>('html');
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('preview');
  const [extractedData, setExtractedData] = useState<ExtractionResult | null>(null);
  const [reactCode, setReactCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Extract HTML with styles
  const extractHtmlWithStyles = (sourceElement: HTMLElement): ExtractionResult => {
    // Get the raw HTML
    const html = sourceElement.outerHTML;

    // Extract all classes and categorize them
    const allClasses: string[] = [];
    const customCSSRules: Map<string, Record<string, string>> = new Map();

    // Recursively collect classes from element and children
    const collectClasses = (el: HTMLElement) => {
      const className = el.getAttribute('class');
      if (className) {
        const classes = className.split(/\s+/).filter(c => c && !c.startsWith('cc-'));
        allClasses.push(...classes);
      }

      // Process children
      Array.from(el.children).forEach(child => {
        if (child instanceof HTMLElement) {
          collectClasses(child);
        }
      });
    };

    collectClasses(sourceElement);

    // Remove duplicates
    const uniqueClasses = Array.from(new Set(allClasses));

    // Categorize classes and extract CSS
    const tailwindClasses: string[] = [];
    const customClasses: string[] = [];

    // Parse stylesheets
    const stylesheets = parsePageStylesheets();

    for (const className of uniqueClasses) {
      const result = extractAuthoredStyles(
        Object.assign(document.createElement('div'), { className })
      );

      if (result.tailwindClasses.includes(className)) {
        tailwindClasses.push(className);
      } else if (result.customClasses.includes(className)) {
        customClasses.push(className);

        // Look up CSS rules for this class
        for (const sheet of stylesheets) {
          const rules = sheet.rules.get(className);
          if (rules && Object.keys(rules).length > 0) {
            customCSSRules.set(className, rules);
          }
        }
      }
    }

    // Generate CSS string
    let customCSS = '';
    for (const [className, rules] of customCSSRules) {
      customCSS += `.${className} {\n`;
      for (const [prop, value] of Object.entries(rules)) {
        customCSS += `  ${prop}: ${value};\n`;
      }
      customCSS += '}\n\n';
    }

    return {
      html,
      customCSS: customCSS.trim(),
      tailwindClasses: Array.from(new Set(tailwindClasses)),
      customClasses: Array.from(new Set(customClasses)),
    };
  };

  // Convert HTML to React JSX (simplified - no style extraction)
  const convertHtmlToReact = (sourceElement: HTMLElement): string => {
    const processElement = (el: HTMLElement): string => {
      const tagName = el.tagName.toLowerCase();

      // Build attributes
      let attributes = '';

      // Copy existing attributes
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        if (attr.name === 'style') continue; // Skip inline styles for now

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

        // Convert relative URLs to absolute URLs for src, href, srcset, poster, etc.
        const urlAttributes = ['src', 'href', 'xlinkHref', 'poster', 'data', 'action'];
        if (urlAttributes.includes(attrName) && attrValue && !attrValue.startsWith('data:') && !attrValue.startsWith('javascript:')) {
          try {
            attrValue = new URL(attrValue, window.location.href).href;
          } catch (e) {
            // Keep original value if URL parsing fails
          }
        }

        // Handle srcset attribute (contains multiple URLs)
        if (attrName === 'srcset' && attrValue) {
          attrValue = attrValue.split(',').map(entry => {
            const parts = entry.trim().split(/\s+/);
            if (parts[0]) {
              try {
                parts[0] = new URL(parts[0], window.location.href).href;
              } catch (e) {
                // Keep original
              }
            }
            return parts.join(' ');
          }).join(', ');
        }

        // Handle attributes with special characters
        if (attrValue.includes('"') || attrValue.includes('{') || attrValue.includes('}')) {
          const escaped = attrValue.replace(/`/g, '\\`').replace(/\$/g, '\\$');
          attributes += ` ${attrName}={\`${escaped}\`}`;
        } else {
          attributes += ` ${attrName}="${attrValue}"`;
        }
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

  // Extract on mount or when element changes
  useEffect(() => {
    try {
      setError(null);
      const result = extractHtmlWithStyles(element);
      setExtractedData(result);

      // Also generate React code
      const code = convertHtmlToReact(element);
      setReactCode(code);
    } catch (err) {
      console.error('Error extracting styles:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
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

  if (error) {
    return (
      <div style={{
        width: '600px',
        maxHeight: '500px',
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ color: '#ef4444', fontWeight: '600', marginBottom: '8px' }}>
          Error Extracting Styles
        </div>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!extractedData) {
    return (
      <div style={{
        width: '600px',
        maxHeight: '500px',
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

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
          onClick={() => setActiveTab('html')}
          style={activeTab === 'html' ? activeTabStyles : tabStyles}
        >
          HTML + CSS
        </button>
        <button
          onClick={() => setActiveTab('react')}
          style={activeTab === 'react' ? activeTabStyles : tabStyles}
        >
          Convert to React
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
        {activeTab === 'html' && (
          <div>
            {/* View Mode Toggle */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                HTML with Original Classes
              </h3>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setViewMode('code')}
                  style={{
                    padding: '4px 12px',
                    background: viewMode === 'code' ? '#3b82f6' : '#e5e7eb',
                    color: viewMode === 'code' ? 'white' : '#6b7280',
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
                  onClick={() => setViewMode('preview')}
                  style={{
                    padding: '4px 12px',
                    background: viewMode === 'preview' ? '#3b82f6' : '#e5e7eb',
                    color: viewMode === 'preview' ? 'white' : '#6b7280',
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
            </div>

            {viewMode === 'code' && (
              <>
                {/* HTML Code */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: 0 }}>
                      HTML
                    </h4>
                    <button
                      onClick={() => navigator.clipboard.writeText(extractedData.html)}
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
                      Copy HTML
                    </button>
                  </div>
                  <pre style={{
                    background: '#1f2937',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: '#e5e7eb',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    margin: 0,
                  }}>
                    <code>{extractedData.html}</code>
                  </pre>
                </div>

                {/* Custom CSS */}
                {extractedData.customCSS && (
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: 0 }}>
                        Custom CSS ({extractedData.customClasses.length} classes)
                      </h4>
                      <button
                        onClick={() => navigator.clipboard.writeText(extractedData.customCSS)}
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
                        Copy CSS
                      </button>
                    </div>
                    <pre style={{
                      background: '#1f2937',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      color: '#e5e7eb',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      margin: 0,
                    }}>
                      <code>{extractedData.customCSS}</code>
                    </pre>
                  </div>
                )}

                {/* Class Summary */}
                <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
                  <div>Tailwind classes: {extractedData.tailwindClasses.length}</div>
                  <div>Custom classes: {extractedData.customClasses.length}</div>
                </div>
              </>
            )}

            {viewMode === 'preview' && (
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
                          if (iframe && extractedData) {
                            console.log('Setting up iframe for HTML preview');
                            const handleMessage = (event: MessageEvent) => {
                              console.log('Received message in parent:', event.data);
                              if (event.data.type === 'SANDBOX_READY' && iframe.contentWindow) {
                                console.log('Sandbox ready, sending HTML to render');
                                iframe.contentWindow.postMessage({
                                  type: 'RENDER_HTML',
                                  html: extractedData.html,
                                  css: extractedData.customCSS,
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
                        title="HTML Preview"
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
        )}

        {activeTab === 'react' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                React Component (JSX)
              </h3>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setViewMode('code')}
                  style={{
                    padding: '4px 12px',
                    background: viewMode === 'code' ? '#3b82f6' : '#e5e7eb',
                    color: viewMode === 'code' ? 'white' : '#6b7280',
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
                  onClick={() => setViewMode('preview')}
                  style={{
                    padding: '4px 12px',
                    background: viewMode === 'preview' ? '#3b82f6' : '#e5e7eb',
                    color: viewMode === 'preview' ? 'white' : '#6b7280',
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
            </div>

            {viewMode === 'code' && (
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '8px',
                }}>
                  <button
                    onClick={() => navigator.clipboard.writeText(reactCode)}
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
                  margin: 0,
                }}>
                  <code>{reactCode}</code>
                </pre>

                {/* Show custom CSS reminder */}
                {extractedData.customCSS && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#92400e',
                  }}>
                    <strong>Note:</strong> This component uses custom CSS classes.
                    Don't forget to include the CSS from the "HTML + CSS" tab.
                  </div>
                )}
              </>
            )}

            {viewMode === 'preview' && (
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
                                  type: 'RENDER_REACT',
                                  code: reactCode,
                                  css: extractedData.customCSS,
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
        )}
      </div>
    </div>
  );
}
