import { AcceptedInput, seq } from './core';

export function regex(
  strings: TemplateStringsArray,
  ...args: readonly AcceptedInput[]
) {
  const result: AcceptedInput[] = [strings[0]];
  args.forEach((arg, i) => {
    result.push(arg, strings[i + 1]);
  });
  return seq(...result);
}
