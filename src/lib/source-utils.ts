/*
 * These methods only work on regex source strings
 */

const tokenMatcher = /(\\[^])|\[\-|[-()|\[\]]/g; // eslint-disable-line no-useless-escape

/**
 * Determines if a regex source has a top level alternation
 * from https://github.com/pygy/compose-regexp.js/blob/master/compose-regexp.js
 */
export function hasTopLevelChoice(source: string) {
  if (source.indexOf('|') === -1) return false;
  let depth = 0;
  let inCharSet = false;
  let match;
  tokenMatcher.lastIndex = 0;
  while ((match = tokenMatcher.exec(source))) {
    if (match[1] != null) continue;
    if (!inCharSet && match[0] === '(') depth++;
    if (!inCharSet && match[0] === ')') depth--;
    if (!inCharSet && (match[0] === '[' || match[0] === '[-')) inCharSet = true;
    if (inCharSet && match[0] === ']') inCharSet = false;
    if (depth === 0 && !inCharSet && match[0] === '|') return true;
  }
  return false;
}

export function isOneGroup(source: string) {
  if (source.charAt(0) !== '(' || source.charAt(source.length - 1) !== ')') {
    return false;
  }
  let depth = 0;
  let inCharSet = false;
  let match;
  tokenMatcher.lastIndex = 0;
  while ((match = tokenMatcher.exec(source))) {
    if (match[1] != null) {
      if (match.index === source.length - 2) return false;
      continue;
    }
    if (!inCharSet && match[0] === '(') depth++;
    if (!inCharSet && match[0] === ')') {
      depth--;
      if (depth === 0 && match.index !== source.length - 1) return false;
    }
    if (!inCharSet && (match[0] === '[' || match[0] === '[-')) inCharSet = true;
    if (inCharSet && match[0] === ']') inCharSet = false;
  }
  return true;
}

const ATOMIC = /^\\[^]$|^\[(?:\\[^]|[^\]])*\]$/;

/**
 * Determines if an source is atomic
 * from https://github.com/pygy/compose-regexp.js/blob/master/compose-regexp.js
 */
export function isAtomic(source: string) {
  return source.length === 1 || ATOMIC.test(source) || isOneGroup(source);
}

const CASING = /\\\\[\s\S]|\(\?<[A-Za-z][A-Za-z\d]+>|[A-Za-z]/g;

/**
 * Make a source ignore case
 * derived from https://github.com/mikesamuel/regexp-make-js
 */
export function ignoreCase(source: string) {
  return source.replace(CASING, (s) => {
    if (s.length === 1) {
      const cu = s.charCodeAt(0) & ~32;
      if (65 <= cu && cu <= 90) {
        return '[' + String.fromCharCode(cu, cu | 32) + ']';
      }
    }
    return s;
  });
}

/**
 * If an input is not atomic, returns the input in a group
 */
export function guaranteeAtomic(source: string): string {
  return isAtomic(source) ? source : `(?:${source})`;
}

export function suffix(source: string, suffix: string) {
  return guaranteeAtomic(source) + suffix;
}

export function chars(source: string, inverse = false) {
  return inverse ? `[^${source}]` : `[${source}]`;
}

export function group(source: string) {
  return `(?:${source})`;
}

export function anyChar(args: string[]) {
  return args.length === 1 ? args[0] : chars(seq(args));
}

export function anyOf(args: string[]): string {
  if (args.every((s) => /^\w$/.test(s))) return anyChar(args);
  if (args.length === 1) return args[0];
  return group(args.join('|'));
}

export function capture(source: string, name?: string): string {
  // TODO: fail on invalid key?
  const prefix = name ? `?<${name}>` : '';
  return `(${prefix}${source})`;
}

export function avoid(source: string): string {
  return /^\w$/.test(source) ? chars(source, true) : `(?!${source})`;
}

export function seq(args: string[]): string {
  if (args.length === 1) return args[0];
  return args
    .map((arg) => (hasTopLevelChoice(arg) ? group(arg) : arg))
    .join('');
}
