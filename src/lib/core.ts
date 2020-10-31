import escape from 'escape-string-regexp';

export type AcceptedInput = string | RegExp | Array<AcceptedInput>;

function normalize(input: AcceptedInput) {
  if (input instanceof RegExp) return input.source;
  if (Array.isArray(input)) return _anyOf(input);
  return escape(input);
}

export const empty = new RegExp('');

// *** Sequences **
function needsGroup(source: string) {
  if (source.indexOf('|') < 0) return false;
  if (source.startsWith('(') && source.endsWith(')')) return false;
  return true;
}

function _seq(args: readonly AcceptedInput[]): string {
  return args
    .map((a) => {
      if (args.length > 1 && a instanceof RegExp && needsGroup(a.source)) {
        return _group(a);
      }
      return normalize(a);
    })
    .join('');
}

export function seq(...args: readonly AcceptedInput[]): RegExp {
  if (!args.length) return empty;
  return new RegExp(_seq(args));
}

// *** Groups **
export function _group(input: AcceptedInput): string {
  return `(?:${normalize(input)})`;
}

export function group(input: AcceptedInput) {
  return new RegExp(_group(input));
}

function _lookAhead(input: AcceptedInput) {
  return `(?=${normalize(input)})`;
}

export function lookAhead(input: AcceptedInput) {
  return new RegExp(_lookAhead(input));
}

function _notChar(source: string): string {
  return `[^${normalize(source)}]`;
}

export function notChar(source: string): RegExp {
  return new RegExp(_notChar(source));
}

function _avoid(input: AcceptedInput): string {
  return typeof input === 'string' && input.length === 1
    ? _notChar(input)
    : `(?!${normalize(input)})`;
}

export function avoid(input: AcceptedInput): RegExp {
  return new RegExp(_avoid(input));
}

function _capture(input: AcceptedInput): string {
  return `(${normalize(input)})`;
}

export function capture(input: AcceptedInput): RegExp {
  return new RegExp(_capture(input));
}

function _optional(input: AcceptedInput): string {
  return typeof input === 'string' && input.length === 1
    ? normalize(input) + '?'
    : _group(input) + '?';
}

export function optional(input: AcceptedInput): RegExp {
  return new RegExp(_optional(input));
}

// TODO: namedCapture

// *** repeats ***

function _oneOrMore(input: AcceptedInput) {
  return typeof input === 'string' && input.length === 1
    ? normalize(input) + '+'
    : _group(input) + '+';
}

export function oneOrMore(input: AcceptedInput) {
  return new RegExp(_oneOrMore(input));
}

function _zeroOrMore(input: AcceptedInput) {
  return typeof input === 'string' && input.length === 1
    ? normalize(input) + '*'
    : _group(input) + '*';
}

export function zeroOrMore(input: AcceptedInput) {
  return new RegExp(_zeroOrMore(input));
}

function _anyChar(args: readonly string[]) {
  return `[${_seq(args)}]`;
}

export function anyChar(...args: readonly string[]) {
  return new RegExp(_anyChar(args));
}

export function _anyOf(args: readonly AcceptedInput[]): string {
  const allChars = args.every((s) => {
    return typeof s === 'string' && s.length === 1;
  });
  return allChars
    ? _anyChar(args as readonly string[])
    : `(?:${args.map(normalize).join('|')})`;
}

export function anyOf(...args: readonly AcceptedInput[]) {
  if (!args.length) return empty;
  return new RegExp(_anyOf(args));
}

// *** Wrappers ***
function _all(source: AcceptedInput) {
  return `^${normalize(source)}$`;
}

export function all(source: AcceptedInput) {
  return new RegExp(_all(source));
}

export function ignoreCase(source: AcceptedInput) {
  source = normalize(source)
    .split('')
    .map((l) => {
      const lc = l.toLowerCase();
      const up = l.toUpperCase();
      if (lc !== up) {
        return `[${up}${lc}]`;
      }
      return l;
    })
    .join('');
  return new RegExp(source);
}

export function flags(source: AcceptedInput, opts: string) {
  return new RegExp(normalize(source), opts);
}
