import escapeRegex from 'escape-string-regexp';
import isRegexp from 'is-regexp';

import { s_anyOf, s_capture, s_ignoreCase } from './source-utils';

export type AcceptedInput = string | number | RegExp | InputArray | InputObject;

type InputArray = Array<AcceptedInput>;
type InputObject = { [K: string]: AcceptedInput };

// TODO: convert multiline /^hello$/m -> /(?<=^|[\n\r])hello(?=$|[\n\r])/ ?

const CAPTURE_NAME = /^[A-Za-z][A-Za-z\d]*/;

function isCaptureObject(input: unknown): input is InputObject {
  if (typeof input === 'object' && input !== null) {
    const keys = Object.keys(input);
    if (keys.length === 1) {
      const key = keys[0];
      return key === '' || key.startsWith('$') || CAPTURE_NAME.test(keys[0]);
    }
  }
  return false;
}

export function normalize(input: AcceptedInput, ignoreFlags = true): string {
  const overallIgnoreCaseFlag = isIgnoreCase(input);

  let source;

  if (isRegexp(input)) {
    source = input.source;
  } else if (Array.isArray(input)) {
    source = s_anyOf(map(input, overallIgnoreCaseFlag));
  } else if (isCaptureObject(input)) {
    const key = Object.keys(input)[0];
    const name = key.startsWith('$') ? '' : key;
    source = s_capture(normalize(input[key], overallIgnoreCaseFlag), name);
  } else {
    source = escapeRegex(String(input));
  }

  const addIgnoreCasingFlag = !ignoreFlags && overallIgnoreCaseFlag;
  return addIgnoreCasingFlag ? s_ignoreCase(source) : source;
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

export function map(args: AcceptedInput[], ignoreFlags = true) {
  return args.map((arg) => normalize(arg, ignoreFlags));
}
