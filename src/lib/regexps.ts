import {
  anyChar,
  anyOf,
  notChar,
  oneOrMore,
  optional,
  seq,
  zeroOrMore,
} from './core';
import { regex } from './lit';

export const digit = /\d/;
export const ws = /\s/;
export const any = /.*/;

export const uint = oneOrMore(digit);
export const int = seq(optional(anyChar('+-')), uint);
export const decimal = anyOf(int, seq(optional(int), '.', int));
export const float = seq(decimal, optional(seq(anyChar('Ee'), int)));
export const word = oneOrMore(/\S/);

export const doubleQuotedString = regex`"${zeroOrMore(notChar(`"`))}"`;
export const singleQuotedString = regex`'${zeroOrMore(notChar(`'`))}'`;
export const string = anyOf(doubleQuotedString, singleQuotedString);

export const USD = regex`\$${decimal}`;
