import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface StyleInspectorProps {
  element: HTMLElement;
}

export function StyleInspector({ element }: StyleInspectorProps) {
  const [activeTab, setActiveTab] = useState<'styling' | 'html' | 'code'>('styling');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
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

  // Generate code using Gemini API
  const generateCode = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
      });

      const prompt = `
You are an expert React/Next.js developer. Generate a clean, production-ready React component based on this HTML element.

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

## Requirements:
- Create a React functional component with TypeScript
- Convert the styles to Tailwind CSS classes wherever possible
- For complex styles that can't be represented in Tailwind, use inline styles
- Use modern React best practices
- Make the component reusable with props for dynamic content
- Include prop types/interface
- Return ONLY the component code wrapped in a code block

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

        {activeTab === 'code' && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
              React + Tailwind Code
            </h3>

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
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    Generated Component:
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                    }}
                    style={{
                      padding: '4px 8px',
                      background: '#3b82f6',
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
                }}>
                  <code>{generatedCode}</code>
                </pre>
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
