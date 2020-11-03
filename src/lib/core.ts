import {
  _anyChar,
  _anyOf,
  _avoid,
  _capture,
  _chars,
  _map,
  _seq,
  AcceptedInput,
  getFlags,
  isIgnoreCase,
  joinFlags,
  normalize,
} from './core-utils';
import { makeAtomic, suffix } from './source-utils';

// *** Sequences **
export const empty = new RegExp('');

export function seq(...args: AcceptedInput[]): RegExp {
  if (!args.length) return empty;
  const hoistCasing = isIgnoreCase(args);
  return new RegExp(_seq(_map(args, hoistCasing)), hoistCasing ? 'i' : '');
}

export function anyOf(...args: AcceptedInput[]): RegExp {
  if (!args.length) return empty;
  const hoistCasing = isIgnoreCase(args);
  return new RegExp(_anyOf(_map(args, hoistCasing)), hoistCasing ? 'i' : '');
}

// *** Groups **

export function ahead(input: AcceptedInput): RegExp {
  return new RegExp(`(?=${normalize(input)})`, isIgnoreCase(input) ? 'i' : '');
}

export function anyChar(arg: string): RegExp {
  return new RegExp(_anyChar(arg.split('')));
}

export function notChar(source: string): RegExp {
  return new RegExp(_chars(normalize(source), true));
}

export function avoid(input: AcceptedInput): RegExp {
  return new RegExp(_avoid(normalize(input)), isIgnoreCase(input) ? 'i' : '');
}

export function capture(input: AcceptedInput, name?: string): RegExp {
  return new RegExp(_capture(input, name), isIgnoreCase(input) ? 'i' : '');
}

export function optional(input: AcceptedInput): RegExp {
  return new RegExp(
    `${makeAtomic(normalize(input))}?`,
    isIgnoreCase(input) ? 'i' : ''
  );
}

// *** repeats ***

export function oneOrMore(input: AcceptedInput) {
  return new RegExp(
    suffix(normalize(input), '+'),
    isIgnoreCase(input) ? 'i' : ''
  );
}

export function zeroOrMore(input: AcceptedInput) {
  return new RegExp(
    suffix(normalize(input), '*'),
    isIgnoreCase(input) ? 'i' : ''
  );
}

export function repeat(
  input: AcceptedInput,
  N: number | [number, number | '']
) {
  let _suffix = `{${N}}`;

  if (Array.isArray(N)) {
    // Simpliy some repeats
    if (N[1] === Infinity || N[1] === '') {
      if (N[0] === 0) _suffix = `*`;
      else if (N[0] === 1) _suffix = `+`;
      else _suffix = `{${N[0]},}`;
    }
  }

  return new RegExp(
    suffix(normalize(input), _suffix),
    isIgnoreCase(input) ? 'i' : ''
  );
}

// *** Wrappers ***

export function all(input: AcceptedInput) {
  return new RegExp(`^${normalize(input)}$`, getFlags(input));
}

// TODO: sequence guard /"[^"]+"/

// *** Flags ***

export function flags(input: AcceptedInput, flags: string) {
  return new RegExp(normalize(input), joinFlags(input, flags));
}

export function ignoreCase(input: AcceptedInput) {
  return flags(input, 'i');
}

export function global(input: AcceptedInput) {
  return flags(input, 'g');
}
