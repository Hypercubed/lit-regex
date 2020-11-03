import escapeRegex from 'escape-string-regexp';
import isRegexp from 'is-regexp';

import { anyOf, capture, ignoreCase } from './source-utils';

export type AcceptedInput = string | RegExp | InputArray | InputObject;

type InputArray = Array<AcceptedInput>;
type InputObject = { [key: string]: AcceptedInput };

// TODO: convert multiline /^hello$/m -> /(?<=^|[\n\r])hello(?=$|[\n\r])/ ?

export function normalize(
  input: AcceptedInput,
  ignoreIgnoreCasing = true
): string {
  const _ignoreCase = isIgnoreCase(input);
  ignoreIgnoreCasing = ignoreIgnoreCasing || !_ignoreCase;

  let source;

  if (isRegexp(input)) {
    source = input.source;
  } else if (Array.isArray(input)) {
    source = anyOf(_map(input, _ignoreCase));
  } else if (typeof input === 'object') {
    source = anyOf(
      Object.keys(input).map((key) => {
        return capture(normalize(input[key], _ignoreCase), makeValidKey(key));
      })
    );
  } else {
    source = escapeRegex(String(input));
  }

  return ignoreIgnoreCasing ? source : ignoreCase(source);
}

const NAMED = /^[A-Za-z][A-Za-z\d]*/;

function makeValidKey(key: string) {
  return NAMED.test(key) ? key : '';
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

export function _map(args: AcceptedInput[], ignoreCasing = true) {
  return args.map((arg) => normalize(arg, ignoreCasing));
}
