import { flags, seq } from './core';
import { AcceptedInput } from './core-utils';

const validFlags = /^[gimuy]+$/;

const _regex = function regex(
  strings: TemplateStringsArray,
  ...args: readonly AcceptedInput[]
) {
  const result: AcceptedInput[] = strings[0] ? [strings[0]] : [];
  args.forEach((arg, i) => {
    result.push(arg);
    if (strings[i + 1]) {
      result.push(strings[i + 1]);
    }
  });
  return seq(...result);
};

interface RegexInterface {
  (strings: TemplateStringsArray, ...args: readonly AcceptedInput[]): RegExp;
  [key: string]: RegexInterface;
}

export const regex = new Proxy(_regex, {
  get: (target: typeof _regex, prop: string, receiver: unknown) => {
    if (Reflect.has(target, prop)) {
      return Reflect.get(target, prop, receiver);
    }
    if (!validFlags.test(prop)) {
      throw new Error(`SyntaxError: Invalid flags supplied to regex '${prop}'`);
    }
    return (
      strings: TemplateStringsArray,
      ...args: readonly AcceptedInput[]
    ) => {
      return flags(target(strings, ...args), prop);
    };
  },
}) as RegexInterface;
