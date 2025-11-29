/**
 * CSS Properties extracted from computed styles
 * Matches the properties extracted in StyleInspector.tsx
 */
export interface CSSProperties {
  // Colors
  color?: string;
  backgroundColor?: string;
  borderColor?: string;

  // Typography
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;
  letterSpacing?: string;

  // Layout
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  flexWrap?: string;
  flexBasis?: string;
  flexGrow?: string;
  flexShrink?: string;
  alignSelf?: string;
  justifySelf?: string;

  // Spacing
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  // Borders
  borderWidth?: string;
  borderStyle?: string;
  borderRadius?: string;

  // Dimensions
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;

  // Position
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: string;

  // Grid
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  gridArea?: string;
  gridAutoFlow?: string;
  gridAutoColumns?: string;
  gridAutoRows?: string;

  // Visual Effects
  boxShadow?: string;
  opacity?: string;
  transform?: string;
  transformOrigin?: string;
  transition?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;

  // Text Styling
  textDecoration?: string;
  textDecorationLine?: string;
  textTransform?: string;
  textOverflow?: string;
  textAlign?: string;
  whiteSpace?: string;
  wordBreak?: string;
  textShadow?: string;

  // Other
  overflow?: string;
  overflowX?: string;
  overflowY?: string;
  cursor?: string;
  pointerEvents?: string;
  userSelect?: string;
  visibility?: string;
  aspectRatio?: string;
  objectFit?: string;
  objectPosition?: string;
  outline?: string;

  // SVG-specific
  stroke?: string;
  fill?: string;
  strokeWidth?: string;
  strokeLinecap?: string;
  strokeLinejoin?: string;
}

/**
 * Result of CSS to Tailwind conversion
 */
export interface ConversionResult {
  /** Array of Tailwind classes */
  classes: string[];
  /** Joined class string for direct use */
  className: string;
  /** Properties that couldn't be converted */
  unconverted: string[];
  /** Count of arbitrary value classes used (e.g., p-[17px]) */
  arbitraryCount: number;
}

/**
 * Parsed color representation
 */
export interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a: number;
  hex: string;
}

/**
 * Parsed spacing/dimension value
 */
export interface ParsedValue {
  value: number;
  unit: 'px' | 'rem' | 'em' | '%' | 'vh' | 'vw' | 'vmin' | 'vmax' | '';
  raw: string;
}

/**
 * Test case for the test harness
 */
export interface TestCase {
  name: string;
  input: CSSProperties;
  expectedClasses?: string[];
  expectedArbitraryMax?: number;
  category: 'colors' | 'spacing' | 'typography' | 'layout' | 'borders' | 'effects' | 'position' | 'complex';
}
