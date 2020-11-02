import escape from 'escape-string-regexp';
import isRegexp from 'is-regexp';

import { hasTopLevelChoice, isAtomic } from './utils';

export type AcceptedInput = string | RegExp | Array<AcceptedInput>;

function normalize(input: AcceptedInput): string {
  if (isRegexp(input)) return input.source;
  if (Array.isArray(input)) return anyOf(...input).source;
  return escape(String(input));
}

function isIgnoreCase(input: AcceptedInput): boolean {
  if (isRegexp(input)) return input.ignoreCase;
  if (Array.isArray(input)) return input.every(isIgnoreCase);
  return false;
}

function _ignoreCase(source: string) {
  return source.replace(/\\\\[\s\S]|[A-Za-z]/g, (s) => {
    if (s.length === 1) {
      const cu = s.charCodeAt(0) & ~32;
      if (65 <= cu && cu <= 90) {
        return '[' + String.fromCharCode(cu, cu | 32) + ']';
      }
    }
    return s;
  });
}

// *** Sequences **
export const empty = new RegExp('');

function _seq(args: string[]): string {
  const needsGroups = args.length > 1;
  return args
    .map((arg) => {
      return needsGroups && hasTopLevelChoice(arg) ? `(?:${arg})` : arg;
    })
    .join('');
}

export function seq(...args: AcceptedInput[]): RegExp {
  if (!args.length) return empty;
  const allIgnoreCase = isIgnoreCase(args);
  return new RegExp(_seq(args.map(arg => {
    const normalized = normalize(arg);
    return (!allIgnoreCase && isIgnoreCase(arg)) ? _ignoreCase(normalized) : normalized;
  })), allIgnoreCase ? 'i' : '');
}


function _anyChar(args: string[]) {
  return args.length === 1 ? normalize(args[0]) : `[${_seq(args.map(normalize))}]`;
}

export function anyChar(arg: string) {
  return new RegExp(_anyChar(arg.split('')));
}

export function _anyOf(args: string[]): string {
  const allChars = args.every((s) => /^\w$/.test(s));
  return allChars ? _anyChar(args) : `(?:${args.join('|')})`;
}

export function anyOf(...args: AcceptedInput[]) {
  if (!args.length) return empty;
  const allIgnoreCase = isIgnoreCase(args);
  return new RegExp(_anyOf(args.map(arg => {
    const normalized = normalize(arg);
    return (!allIgnoreCase && isRegexp(arg) && arg.ignoreCase) ? _ignoreCase(normalized) : normalized;
  })), allIgnoreCase ? 'i' : '');
}

// *** Groups **

/**
 * If an input is not atomic, returns the input in a group
 */
export function _group(source: string): string {
  return isAtomic(source) ? source : `(?:${source})`
}

export function ahead(input: AcceptedInput) {
  return new RegExp(
    `(?=${normalize(input)})`,
    isIgnoreCase(input) ? 'i' : ''
  );
}

function _notChar(source: string): string {
  return `[^${source}]`;
}

export function notChar(source: string): RegExp {
  return new RegExp(_notChar(normalize(source)));
}

function _avoid(source: string): string {
  return /^\w$/.test(source) ? _notChar(source) : `(?!${source})`;
}

export function avoid(input: AcceptedInput): RegExp {
  return new RegExp(
    _avoid(normalize(input)),
    isIgnoreCase(input) ? 'i' : ''
  );
}

export function capture(input: AcceptedInput): RegExp {
  return new RegExp(
    `(${normalize(input)})`,
    isIgnoreCase(input) ? 'i' : ''
  );
}

export function named(input: AcceptedInput, name: string): RegExp {
  return new RegExp(`(?<${name}>${normalize(input)})`, isIgnoreCase(input) ? 'i' : '');
}

export function optional(input: AcceptedInput): RegExp {
  return new RegExp(
    `${_group(normalize(input))}?`,
    isIgnoreCase(input) ? 'i' : ''
  );
}

// *** repeats ***

export function oneOrMore(input: AcceptedInput) {
  return new RegExp(
    `${_group(normalize(input))}+`,
    isIgnoreCase(input) ? 'i' : ''
  );
}

export function zeroOrMore(input: AcceptedInput) {
  return new RegExp(
    `${_group(normalize(input))}*`,
    isIgnoreCase(input) ? 'i' : ''
  );
}

// TODO: simplify some repeats??
export function repeat(input: AcceptedInput, N: number | [number, number]) {
  return new RegExp(
    `${_group(normalize(input))}{${N}}`,
    isIgnoreCase(input) ? 'i' : ''
  );
}

// *** Wrappers ***

export function all(input: AcceptedInput) {
  return new RegExp(`^${normalize(input)}$`, isIgnoreCase(input) ? 'i' : '');
}

export function ignoreCase(input: AcceptedInput) {
  return new RegExp(normalize(input), 'i');
}

export function flags(input: AcceptedInput, opts: string) {
  return new RegExp(normalize(input), opts);
}
