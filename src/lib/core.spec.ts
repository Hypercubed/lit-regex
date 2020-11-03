import {
  ahead,
  all,
  anyOf,
  avoid,
  capture,
  flags,
  global,
  ignoreCase,
  oneOrMore,
  optional,
  repeat,
  seq,
  zeroOrMore,
} from './core';

test('seq', () => {
  expect(seq()).toEqual(/(?:)/);
  expect(seq('')).toEqual(/(?:)/);
  expect(seq('', '', '')).toEqual(/(?:)/);

  expect(seq('a')).toEqual(/a/);
  expect(seq('a', 'b')).toEqual(/ab/);
  expect(seq('a', 'b', 'c')).toEqual(/abc/);

  expect(seq(/a/)).toEqual(/a/);
  expect(seq(/a/, /b/)).toEqual(/ab/);
  expect(seq(/a/, /b/, /c/)).toEqual(/abc/);

  expect(seq('a', /b|c/)).toEqual(/a(?:b|c)/);

  expect(seq(/^/, 'b', /$/)).toEqual(/^b$/);
  expect(anyOf(seq(seq(/a|b/)))).toEqual(/a|b/);
  expect(seq('thingy', anyOf(/[a]/, /b/))).toEqual(/thingy(?:[a]|b)/);

  expect(seq(/a/i)).toEqual(/a/i);
  expect(seq(/a/i, 'b')).toEqual(/[Aa]b/);
  expect(seq(/a/i, /b/i)).toEqual(/ab/i);

  expect(seq(/a/i, { name: /b/i })).toEqual(/a(?<name>b)/i);
  expect(seq(/a/i, { n: /b/i })).toEqual(/a(?<n>b)/i);

  expect(seq('$', /hElLo/i)).toEqual(/\$[Hh][Ee][Ll][Ll][Oo]/);
});

test('ignoreCase', () => {
  expect(ignoreCase('WoRld')).toEqual(/WoRld/i);
  expect(ignoreCase('Hello world')).toEqual(/Hello world/i);

  expect(ignoreCase('WoRld').test('world')).toBe(true);

  expect(seq(ignoreCase('a'), 'b')).toEqual(/[Aa]b/);
  expect(seq(ignoreCase(/a/), 'b')).toEqual(/[Aa]b/);
  expect(seq(ignoreCase(/a/i), 'b')).toEqual(/[Aa]b/);

  expect(ignoreCase(seq(/a/i, 'b'))).toEqual(/[Aa]b/i);

  expect(ignoreCase(ignoreCase('WoRld'))).toEqual(/WoRld/i);

  expect(ignoreCase({ name: 'WoRld' })).toEqual(/(?<name>WoRld)/i);
});

test('anyOf', () => {
  expect(anyOf()).toEqual(/(?:)/);

  expect(anyOf('Hello', 'World')).toEqual(/(?:Hello|World)/);
  expect(anyOf('Hello', 'World', 'Earth')).toEqual(/(?:Hello|World|Earth)/);

  expect(anyOf('Hello', 'World')).toEqual(/(?:Hello|World)/);
  expect(anyOf(/Hello/, /[Ww]orld/)).toEqual(/(?:Hello|[Ww]orld)/);
  expect(anyOf('Hello', /[Ww]orld/)).toEqual(/(?:Hello|[Ww]orld)/);

  expect(anyOf('a', 'b', 'c')).toEqual(/[abc]/);

  expect(anyOf(/a/i)).toEqual(/a/i);
  expect(anyOf(/a/i, 'b')).toEqual(/(?:[Aa]|b)/);
  expect(anyOf(/a/i, /b/i)).toEqual(/[ab]/i);

  expect(anyOf(/a/i, { name: 'WoRld' })).toEqual(/(?:[Aa]|(?<name>WoRld))/);
});

test('avoid', () => {
  expect(avoid('World')).toEqual(/(?!World)/);

  expect(avoid('a')).toEqual(/[^a]/);
  expect(avoid('ab')).toEqual(/(?!ab)/);
  expect(avoid('abc')).toEqual(/(?!abc)/);

  expect(avoid(/a/)).toEqual(/[^a]/);
  expect(avoid(/ab/)).toEqual(/(?!ab)/);
  expect(avoid(/abc/)).toEqual(/(?!abc)/);

  expect(avoid(['hello', 'world'])).toEqual(/(?!(?:hello|world))/);
  expect(avoid([/Hello/, /[Ww]orld/])).toEqual(/(?!(?:Hello|[Ww]orld))/);
  expect(avoid(['Hello', /[Ww]orld/])).toEqual(/(?!(?:Hello|[Ww]orld))/);

  expect(avoid(/a/i)).toEqual(/[^a]/i);
  expect(avoid(/hello/i)).toEqual(/(?!hello)/i);
});

test('ahead', () => {
  expect(ahead('World')).toEqual(/(?=World)/);
  expect(ahead(/[Ww]orld/)).toEqual(/(?=[Ww]orld)/);

  expect(ahead(['hello', 'world'])).toEqual(/(?=(?:hello|world))/);
  expect(ahead([/Hello/, /[Ww]orld/])).toEqual(/(?=(?:Hello|[Ww]orld))/);
  expect(ahead(['Hello', /[Ww]orld/])).toEqual(/(?=(?:Hello|[Ww]orld))/);

  expect(ahead(/a/i)).toEqual(/(?=a)/i);
  expect(ahead(/hello/i)).toEqual(/(?=hello)/i);
});

test('capture', () => {
  expect(capture('World')).toEqual(/(World)/);
  expect(capture(/Hello/)).toEqual(/(Hello)/);

  expect(capture(['hello', 'world'])).toEqual(/((?:hello|world))/);
  expect(capture([/Hello/, /[Ww]orld/])).toEqual(/((?:Hello|[Ww]orld))/);
  expect(capture(['Hello', /[Ww]orld/])).toEqual(/((?:Hello|[Ww]orld))/);

  expect(capture(/a/i)).toEqual(/(a)/i);
  expect(capture(/hello/i)).toEqual(/(hello)/i);
});

test('named capture', () => {
  expect(capture('World', 'planet')).toEqual(/(?<planet>World)/);
  expect(capture(/Hello/, 'greeting')).toEqual(/(?<greeting>Hello)/);

  expect(capture(['hello', 'world'], 'greeting')).toEqual(
    /(?<greeting>(?:hello|world))/
  );

  expect(capture(/a/i, 'letter')).toEqual(/(?<letter>a)/i);
  expect(capture(/hello/i, 'greet')).toEqual(/(?<greet>hello)/i);

  expect(capture(/a/i, 'b')).toEqual(/(?<b>a)/i);

  expect(capture({ b: /a/i })).toEqual(/((?<b>a))/i); // ??
});

test('optional', () => {
  expect(optional('a')).toEqual(/a?/);

  expect(optional('World')).toEqual(/(?:World)?/);
  expect(optional(/World/)).toEqual(/(?:World)?/);

  expect(optional(['hello', 'world'])).toEqual(/(?:hello|world)?/);
  expect(optional([/Hello/, /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)?/);
  expect(optional(['Hello', /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)?/);

  expect(optional(/a/i)).toEqual(/a?/i);
  expect(optional(/hello/i)).toEqual(/(?:hello)?/i);
});

test('all', () => {
  expect(all('World')).toEqual(/^World$/);
  expect(all(/World/)).toEqual(/^World$/);

  expect(all(['hello', 'world'])).toEqual(/^(?:hello|world)$/);
  expect(all([/Hello/, /[Ww]orld/])).toEqual(/^(?:Hello|[Ww]orld)$/);
  expect(all(['Hello', /[Ww]orld/])).toEqual(/^(?:Hello|[Ww]orld)$/);
});

test('oneOrMore', () => {
  expect(oneOrMore('a')).toEqual(/a+/);
  expect(oneOrMore(/a/)).toEqual(/a+/);
  expect(oneOrMore(/[abc]/)).toEqual(/[abc]+/);

  expect(oneOrMore('World')).toEqual(/(?:World)+/);
  expect(oneOrMore(/World/)).toEqual(/(?:World)+/);

  expect(oneOrMore(['hello', 'world'])).toEqual(/(?:hello|world)+/);
  expect(oneOrMore([/Hello/, /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)+/);
  expect(oneOrMore(['Hello', /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)+/);

  expect(oneOrMore(/a/i)).toEqual(/a+/i);
  expect(oneOrMore(/hello/i)).toEqual(/(?:hello)+/i);
});

test('zeroOrMore', () => {
  expect(zeroOrMore('a')).toEqual(/a*/);

  expect(zeroOrMore('World')).toEqual(/(?:World)*/);
  expect(zeroOrMore(/World/)).toEqual(/(?:World)*/);

  expect(zeroOrMore(['hello', 'world'])).toEqual(/(?:hello|world)*/);
  expect(zeroOrMore([/Hello/, /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)*/);
  expect(zeroOrMore(['Hello', /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)*/);

  expect(zeroOrMore(/a/i)).toEqual(/a*/i);
  expect(zeroOrMore(/hello/i)).toEqual(/(?:hello)*/i);
});

test('flags', () => {
  expect(flags('World', 'gmi')).toEqual(/World/gim);
  expect(flags(/World/, 'i')).toEqual(/World/i);

  expect(flags(['hello', 'world'], 'g')).toEqual(/(?:hello|world)/g);
  expect(flags([/Hello/, /[Ww]orld/], 'm')).toEqual(/(?:Hello|[Ww]orld)/m);
  expect(flags(['Hello', /[Ww]orld/], 'i')).toEqual(/(?:Hello|[Ww]orld)/i);
});

test('global', () => {
  expect(global('WoRld')).toEqual(/WoRld/g);
  expect(global('Hello world')).toEqual(/Hello world/g);

  expect(global(seq(/a/i, 'b'))).toEqual(/[Aa]b/g);

  expect(global(global('WoRld'))).toEqual(/WoRld/g);
});

test('repeat', () => {
  expect(repeat('a', 1)).toEqual(/a{1}/);
  expect(repeat(/a/, 2)).toEqual(/a{2}/);
  expect(repeat(/[abc]/, [3, 6])).toEqual(/[abc]{3,6}/);

  expect(repeat('World', 4)).toEqual(/(?:World){4}/);
  expect(repeat(/World/, [5, 7])).toEqual(/(?:World){5,7}/);

  expect(repeat(/a/i, 3)).toEqual(/a{3}/i);
  expect(repeat(/hello/i, [1, 5])).toEqual(/(?:hello){1,5}/i);

  expect(repeat(/hello/, [5, Infinity])).toEqual(/(?:hello){5,}/);

  expect(repeat(/hello/, [0, Infinity])).toEqual(/(?:hello)*/);
  expect(repeat(/hello/, [1, Infinity])).toEqual(/(?:hello)+/);
});

test('multiline', () => {
  expect(anyOf(/^abc$/m, /^xyz$/)).toEqual(/(?:^abc$|^xyz$)/); // TODO: /(?<=^|[\n\r])abc(?=$|[\n\r])|^xyz$/

  expect(seq(/^abc$/m, /xyz/)).toEqual(/^abc$xyz/); // TODO: /(?<=^|[\n\r])abc(?=$|[\n\r])xyz/  ???
});
