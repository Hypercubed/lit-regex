import escapeRegex from 'escape-string-regexp';
import isRegexp from 'is-regexp';

import { s_anyOf, s_capture, s_ignoreCase } from './source-utils';

export type AcceptedInput = string | RegExp | InputArray | InputObject;

type InputArray = Array<AcceptedInput>;
type InputObject = { [key: string]: AcceptedInput };

// TODO: convert multiline /^hello$/m -> /(?<=^|[\n\r])hello(?=$|[\n\r])/ ?

const CAPTURE_NAME = /^[A-Za-z][A-Za-z\d]*/;

export function normalize(
  input: AcceptedInput,
  ignoreFlags = true
): string {
  const overallIgnoreCaseFlag = isIgnoreCase(input);

  let source;

  if (isRegexp(input)) {
    source = input.source;
  } else if (Array.isArray(input)) {
    source = s_anyOf(map(input, overallIgnoreCaseFlag));
  } else if (typeof input === 'object') {
    source = s_anyOf(
      Object.keys(input).map((key) => {
        return s_capture(normalize(input[key], overallIgnoreCaseFlag), CAPTURE_NAME.test(key) ? key : '');
      })
    );
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
