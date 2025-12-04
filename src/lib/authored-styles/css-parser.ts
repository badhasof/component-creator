/**
 * CSS Parser
 *
 * Parses page stylesheets to extract authored CSS rules.
 * Uses the browser's CSSOM API to access stylesheet rules.
 */

export interface ParsedStylesheet {
  href: string | null;
  rules: Map<string, Record<string, string>>;
}

// Cache parsed stylesheets to avoid re-parsing
let cachedStylesheets: ParsedStylesheet[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5000; // 5 seconds

/**
 * Parse all stylesheets on the page and extract class-based rules
 */
export function parsePageStylesheets(): ParsedStylesheet[] {
  const now = Date.now();

  // Return cached result if still valid
  if (cachedStylesheets && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedStylesheets;
  }

  const stylesheets: ParsedStylesheet[] = [];

  // Get all stylesheets from the document
  const sheets = document.styleSheets;

  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];

    try {
      // Access cssRules - this may throw SecurityError for cross-origin stylesheets
      const rules = sheet.cssRules || sheet.rules;
      if (!rules) continue;

      const parsed: ParsedStylesheet = {
        href: sheet.href,
        rules: new Map(),
      };

      parseRules(rules, parsed.rules);
      stylesheets.push(parsed);
    } catch (e) {
      // Cross-origin stylesheet - skip silently
      // In the future, we could try fetching via background script
      console.debug(`Cannot access stylesheet: ${sheet.href}`, e);
    }
  }

  // Also parse inline <style> elements (already included in document.styleSheets)

  cachedStylesheets = stylesheets;
  cacheTimestamp = now;

  return stylesheets;
}

/**
 * Recursively parse CSS rules, handling @media, @supports, etc.
 */
function parseRules(
  rules: CSSRuleList,
  result: Map<string, Record<string, string>>,
  _parentMedia?: string
): void {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];

    if (rule instanceof CSSStyleRule) {
      // Regular style rule
      parseStyleRule(rule, result);
    } else if (rule instanceof CSSMediaRule) {
      // @media rule - parse nested rules
      // We'll include media query rules as they may apply at current viewport
      parseRules(rule.cssRules, result, rule.conditionText);
    } else if (rule instanceof CSSSupportsRule) {
      // @supports rule - check if supported and parse
      if (CSS.supports(rule.conditionText)) {
        parseRules(rule.cssRules, result);
      }
    } else if ('cssRules' in rule && (rule as CSSGroupingRule).cssRules) {
      // Other grouping rules (e.g., @layer)
      parseRules((rule as CSSGroupingRule).cssRules, result);
    }
  }
}

/**
 * Parse a single CSS style rule and extract class selectors
 */
function parseStyleRule(
  rule: CSSStyleRule,
  result: Map<string, Record<string, string>>
): void {
  const selectorText = rule.selectorText;
  const style = rule.style;

  // Extract all class selectors from the selector
  // Handle complex selectors like ".foo.bar", ".foo:hover", ".foo > .bar"
  const classMatches = selectorText.match(/\.[\w-]+/g);

  if (!classMatches) return;

  // Extract the styles as a plain object
  const styles: Record<string, string> = {};
  for (let i = 0; i < style.length; i++) {
    const prop = style[i];
    const value = style.getPropertyValue(prop);
    if (value) {
      styles[prop] = value;
    }
  }

  if (Object.keys(styles).length === 0) return;

  // For each class in the selector, store the styles
  // We prioritize simple selectors (.classname) over complex ones
  for (const classMatch of classMatches) {
    const className = classMatch.slice(1); // Remove leading dot

    // Skip Tailwind-like utility classes in stylesheets (shouldn't happen often)
    // and skip our extension's classes
    if (className.startsWith('cc-')) continue;

    // Check selector complexity
    const isSimpleSelector = selectorText === `.${className}`;
    const hasPseudoClass = selectorText.includes(':');
    const hasOtherSelectors = selectorText.includes(' ') ||
                               selectorText.includes('>') ||
                               selectorText.includes('+') ||
                               selectorText.includes('~');

    // Priority: simple > compound (no pseudo) > compound (with pseudo) > complex
    const existing = result.get(className);

    if (!existing) {
      // First time seeing this class
      result.set(className, { ...styles });
    } else if (isSimpleSelector) {
      // Simple selector always wins, merge on top
      result.set(className, { ...existing, ...styles });
    } else if (!hasOtherSelectors && !hasPseudoClass) {
      // Compound selector without pseudo, merge if no conflict
      for (const [prop, value] of Object.entries(styles)) {
        if (!existing[prop]) {
          existing[prop] = value;
        }
      }
    }
    // Complex selectors or pseudo-classes: we're conservative
    // The simple/compound rules already captured should have the base styles
  }
}

/**
 * Get authored styles for a specific class name
 */
export function getStylesForClass(className: string): Record<string, string> | null {
  const stylesheets = parsePageStylesheets();

  // Search through all stylesheets
  for (const sheet of stylesheets) {
    const styles = sheet.rules.get(className);
    if (styles && Object.keys(styles).length > 0) {
      return styles;
    }
  }

  return null;
}

/**
 * Get authored styles for multiple class names, merged in order
 */
export function getStylesForClasses(classNames: string[]): Record<string, string> {
  const stylesheets = parsePageStylesheets();
  const merged: Record<string, string> = {};

  for (const className of classNames) {
    for (const sheet of stylesheets) {
      const styles = sheet.rules.get(className);
      if (styles) {
        Object.assign(merged, styles);
      }
    }
  }

  return merged;
}

/**
 * Clear the stylesheet cache (useful when stylesheets change)
 */
export function clearStylesheetCache(): void {
  cachedStylesheets = null;
  cacheTimestamp = 0;
}
