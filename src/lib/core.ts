import clone from 'clone-regexp';
import escape from 'escape-string-regexp';
import isRegexp from 'is-regexp';

import { hasTopLevelChoice, isAtomic } from './utils';

export type AcceptedInput = string | RegExp | Array<AcceptedInput>;

function normalize(input: AcceptedInput): string {
  if (isRegexp(input))
    return input.ignoreCase ? _ignoreCase(input.source) : input.source;
  if (Array.isArray(input)) return _anyOf(input.map(normalize));
  return escape(String(input));
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

export function seq(...args: readonly AcceptedInput[]): RegExp {
  if (!args.length) return empty;
  if (args.length === 1 && isRegexp(args[0]))
    return clone(args[0], { lastIndex: 0 }); // if only one regexp, return a clone
  const allIgnoreCase = args.every((arg) => isRegexp(arg) && arg.ignoreCase);
  if (allIgnoreCase) {
    return new RegExp(
      _seq(
        args.map((a) =>
          normalize(clone(a as RegExp, { ignoreCase: false, lastIndex: 0 }))
        )
      ),
      'i'
    ); // if all are regexp and case ignored; move ignore flag to top
  }
  return new RegExp(_seq(args.map(normalize)));
}

// *** Groups **
export function _group(source: string): string {
  return `(?:${source})`;
}

export function group(input: AcceptedInput) {
  return new RegExp(_group(normalize(input)));
}

export function lookAhead(input: AcceptedInput) {
  return new RegExp(`(?=${normalize(input)})`);
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
  return new RegExp(_avoid(normalize(input)));
}

export function capture(input: AcceptedInput): RegExp {
  return new RegExp(`(${normalize(input)})`);
}

export function optional(input: AcceptedInput): RegExp {
  const normalized = normalize(input);
  return new RegExp(
    isAtomic(normalized) ? `${normalized}?` : `(?:${normalized})?`
  );
}

// *** repeats ***

export function oneOrMore(input: AcceptedInput) {
  const normalized = normalize(input);
  return new RegExp(
    isAtomic(normalized) ? `${normalized}+` : `(?:${normalized})+`
  );
}

export function zeroOrMore(input: AcceptedInput) {
  const normalized = normalize(input);
  return new RegExp(
    isAtomic(normalized) ? `${normalized}*` : `(?:${normalized})*`
  );
}

function _anyChar(args: readonly string[]) {
  return `[${_seq(args.map(normalize))}]`;
}

export function anyChar(...args: readonly string[]) {
  return new RegExp(_anyChar(args));
}

export function _anyOf(args: string[]): string {
  const allChars = args.every((s) => /^\w$/.test(s));
  return allChars ? _anyChar(args) : `(?:${args.join('|')})`;
}

export function anyOf(...args: readonly AcceptedInput[]) {
  if (!args.length) return empty;
  return new RegExp(_anyOf(args.map(normalize)));
}

// *** Wrappers ***

export function all(input: AcceptedInput) {
  return new RegExp(`^${normalize(input)}$`);
}

export function _ignoreCase(source: string) {
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

export function ignoreCase(input: AcceptedInput) {
  if (isRegexp(input) && input.ignoreCase)
    return clone(input, { lastIndex: 0 });
  return new RegExp(normalize(input), 'i');
}

export function flags(input: AcceptedInput, opts: string) {
  return new RegExp(normalize(input), opts);
}

export function repeat(input: AcceptedInput, N: number | [number, number]) {
  const normalized = normalize(input);
  return new RegExp(
    isAtomic(normalized) ? `${normalized}{${N}}` : `(?:${normalized}){${N}}`
  );
}

export function named(input: AcceptedInput, name: string): RegExp {
  return new RegExp(`(?<${name}>${normalize(input)})`);
}
