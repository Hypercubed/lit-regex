import escape from 'escape-string-regexp';
import isRegexp from 'is-regexp';

import { ignoreCase as _ignoreCase, hasTopLevelChoice } from './source-utils';

export type AcceptedInput = string | RegExp | InputArray | InputObject;

type InputArray = Array<AcceptedInput>;
type InputObject = { [key: string]: AcceptedInput };

// TODO: convert multiline /^hello$/ -> /(?<=\A|[\n\r])hello(?=\Z|[\n\r])/ ?

export function normalize(
  input: AcceptedInput,
  ignoreIgnoreCasing = true
): string {
  const ignoreCase = isIgnoreCase(input);
  ignoreIgnoreCasing = ignoreIgnoreCasing || !ignoreCase;

  let source;

  if (isRegexp(input)) {
    source = input.source;
  } else if (Array.isArray(input)) {
    source = _anyOf(_map(input, ignoreCase));
  } else if (typeof input === 'object') {
    source = _anyOf(Object.keys(input).map((k) => _capture(input[k], k)));
  } else {
    source = escape(String(input));
  }

  return ignoreIgnoreCasing ? source : _ignoreCase(source);
}

export function isIgnoreCase(input: AcceptedInput): boolean {
  if (isRegexp(input)) return input.ignoreCase;
  if (Array.isArray(input)) return input.every(isIgnoreCase);
  if (typeof input === 'object') {
    return Object.keys(input).every((k) => isIgnoreCase(input[k]));
  }
  return false;
}

export function getFlags(input: AcceptedInput) {
  return isRegexp(input) ? input.flags : isIgnoreCase(input) ? 'i' : '';
}

export function joinFlags(input: AcceptedInput, flags: string) {
  return getFlags(input)
    .split('')
    .reduce((acc, f) => {
      if (!acc.includes(f)) return acc + f;
      return acc;
    }, flags);
}

export function _seq(args: string[]): string {
  if (args.length === 1) return args[0];
  return args
    .map((arg) => (hasTopLevelChoice(arg) ? _group(arg) : arg))
    .join('');
}

export function _map(args: AcceptedInput[], ignoreCasing = true) {
  return args.map((arg) => normalize(arg, ignoreCasing));
}

export function _chars(source: string, inverse = false) {
  return inverse ? `[^${source}]` : `[${source}]`;
}

export function _group(source: string) {
  return `(?:${source})`;
}

export function _anyChar(args: string[]) {
  return args.length === 1 ? normalize(args[0]) : _chars(_seq(_map(args)));
}

export function _anyOf(args: string[]): string {
  if (args.every((s) => /^\w$/.test(s))) return _anyChar(args);
  if (args.length === 1) return args[0];
  return _group(args.join('|'));
}

export function _capture(input: AcceptedInput, name?: string): string {
  const prefix = name ? `?<${name}>` : '';
  return `(${prefix}${normalize(input)})`;
}

export function _avoid(source: string): string {
  return /^\w$/.test(source) ? _chars(source, true) : `(?!${source})`;
}
