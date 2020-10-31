import escape from 'escape-string-regexp';

import { hasTopLevelChoice, isAtomic } from './utils';

export type AcceptedInput = string | RegExp | Array<AcceptedInput>;

function normalize(input: AcceptedInput) {
  if (input instanceof RegExp) return input.source;
  if (Array.isArray(input)) return _anyOf(input);
  return escape(String(input));
}

// *** Sequences **
export const empty = new RegExp('');

function _seq(args: readonly AcceptedInput[]): string {
  return args
    .map((arg) => {
      return args.length > 1 &&
        arg instanceof RegExp &&
        hasTopLevelChoice(arg.source)
        ? _group(arg)
        : normalize(arg);
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

export function lookAhead(input: AcceptedInput) {
  return new RegExp(`(?=${normalize(input)})`);
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

export function capture(input: AcceptedInput): RegExp {
  return new RegExp(`(${normalize(input)})`);
}

export function optional(input: AcceptedInput): RegExp {
  return new RegExp((isAtomic(input) ? normalize(input) : _group(input)) + '?');
}

// *** repeats ***

export function oneOrMore(input: AcceptedInput) {
  return new RegExp((isAtomic(input) ? normalize(input) : _group(input)) + '+');
}
export function zeroOrMore(input: AcceptedInput) {
  return new RegExp((isAtomic(input) ? normalize(input) : _group(input)) + '*');
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

export function all(input: AcceptedInput) {
  return new RegExp(`^${normalize(input)}$`);
}

export function ignoreCase(input: AcceptedInput) {
  input = normalize(input)
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
  return new RegExp(input);
}

export function flags(input: AcceptedInput, opts: string) {
  return new RegExp(normalize(input), opts);
}

export function repeat(input: AcceptedInput, N: number | [number, number]) {
  return new RegExp(
    (isAtomic(input) ? normalize(input) : _group(input)) + `{${N}}`
  );
}

export function named(input: AcceptedInput, name: string): RegExp {
  return new RegExp(`(?<${name}>${normalize(input)})`);
}
