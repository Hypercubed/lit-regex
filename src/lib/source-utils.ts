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

/**
 * Determines if an source is atomic
 * from https://github.com/pygy/compose-regexp.js/blob/master/compose-regexp.js
 */
export function isAtomic(source: string) {
  return (
    source.length === 1 ||
    /^\\[^]$|^\[(?:\\[^]|[^\]])*\]$/.test(source) ||
    isOneGroup(source)
  );
}

/**
 * Make a source ignore case
 * derived from https://github.com/mikesamuel/regexp-make-js
 */
export function ignoreCase(source: string) {
  return source.replace(
    /\\\\[\s\S]|\(\?<[A-Za-z][A-Za-z\d]+>|[A-Za-z]/g,
    (s) => {
      if (s.length === 1) {
        const cu = s.charCodeAt(0) & ~32;
        if (65 <= cu && cu <= 90) {
          return '[' + String.fromCharCode(cu, cu | 32) + ']';
        }
      }
      return s;
    }
  );
}

/**
 * If an input is not atomic, returns the input in a group
 */
export function makeAtomic(source: string): string {
  return isAtomic(source) ? source : `(?:${source})`;
}

export function suffix(source: string, suffix: string) {
  return makeAtomic(source) + suffix;
}
