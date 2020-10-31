import {
  all,
  anyOf,
  avoid,
  capture,
  flags,
  group,
  ignoreCase,
  lookAhead,
  named,
  oneOrMore,
  optional,
  repeat,
  seq,
  zeroOrMore,
} from './core';

test('seq', () => {
  expect(seq()).toEqual(/(?:)/);
  expect(seq('')).toEqual(/(?:)/); // ??
  expect(seq('', '', '')).toEqual(/(?:)/); // ??

  expect(seq('a')).toEqual(/a/);
  expect(seq('a', 'b')).toEqual(/ab/);
  expect(seq('a', 'b', 'c')).toEqual(/abc/);

  expect(seq(/a/)).toEqual(/a/);
  expect(seq(/a/, /b/)).toEqual(/ab/);
  expect(seq(/a/, /b/, /c/)).toEqual(/abc/);

  expect(seq('a', /b|c/)).toEqual(/a(?:b|c)/);

  expect(seq(/^/, 'b', /$/)).toEqual(/^b$/);
  expect(anyOf(seq(seq(/a|b/)))).toEqual(/(?:a|b)/);
  expect(seq('thingy', anyOf(/[a]/, /b/))).toEqual(/thingy(?:[a]|b)/);

  expect(seq(/a/i)).toEqual(/a/i);
  expect(seq(/a/i, 'b')).toEqual(/[Aa]b/);
  expect(seq(/a/i, /b/i)).toEqual(/ab/i);
});

test('ignoreCase', () => {
  expect(ignoreCase('WoRld')).toEqual(/WoRld/i);
  expect(ignoreCase('Hello world')).toEqual(/Hello world/i);

  expect(ignoreCase('WoRld').test('world')).toBe(true);

  expect(seq(ignoreCase('a'), 'b')).toEqual(/[Aa]b/);
  expect(seq(ignoreCase(/a/), 'b')).toEqual(/[Aa]b/);
  expect(seq(ignoreCase(/a/i), 'b')).toEqual(/[Aa]b/);

  expect(seq(/a/i, 'b')).toEqual(/[Aa]b/);

  expect(ignoreCase(seq(/a/i, 'b'))).toEqual(/[Aa]b/i);  // TODO: /ab/i ?

  expect(ignoreCase(ignoreCase('WoRld'))).toEqual(/WoRld/i);
});

test('anyOf', () => {
  expect(anyOf()).toEqual(/(?:)/); // ??

  expect(anyOf('Hello', 'World')).toEqual(/(?:Hello|World)/);
  expect(anyOf('Hello', 'World', 'Earth')).toEqual(/(?:Hello|World|Earth)/);

  expect(anyOf('Hello', 'World')).toEqual(/(?:Hello|World)/);
  expect(anyOf(/Hello/, /[Ww]orld/)).toEqual(/(?:Hello|[Ww]orld)/);
  expect(anyOf('Hello', /[Ww]orld/)).toEqual(/(?:Hello|[Ww]orld)/);

  expect(anyOf('a', 'b', 'c')).toEqual(/[abc]/);
});

test('group', () => {
  expect(group('World')).toEqual(/(?:World)/);

  expect(group('a')).toEqual(/(?:a)/); // TODO: /a/ ?
  expect(group('ab')).toEqual(/(?:ab)/);
  expect(group('abc')).toEqual(/(?:abc)/);

  expect(group(/a/)).toEqual(/(?:a)/); // TODO: /a/ ?
  expect(group(/ab/)).toEqual(/(?:ab)/);
  expect(group(/abc/)).toEqual(/(?:abc)/);

  expect(group(['hello', 'world'])).toEqual(/(?:(?:hello|world))/); // TODO: (?:hello|world) ?
  expect(group([/Hello/, /[Ww]orld/])).toEqual(/(?:(?:Hello|[Ww]orld))/);
  expect(group(['Hello', /[Ww]orld/])).toEqual(/(?:(?:Hello|[Ww]orld))/);
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
});

test('lookAhead', () => {
  expect(lookAhead('World')).toEqual(/(?=World)/);
  expect(lookAhead(/[Ww]orld/)).toEqual(/(?=[Ww]orld)/);

  expect(lookAhead(['hello', 'world'])).toEqual(/(?=(?:hello|world))/);
  expect(lookAhead([/Hello/, /[Ww]orld/])).toEqual(/(?=(?:Hello|[Ww]orld))/);
  expect(lookAhead(['Hello', /[Ww]orld/])).toEqual(/(?=(?:Hello|[Ww]orld))/);
});

test('capture', () => {
  expect(capture('World')).toEqual(/(World)/);
  expect(capture(/Hello/)).toEqual(/(Hello)/);

  expect(capture(['hello', 'world'])).toEqual(/((?:hello|world))/);
  expect(capture([/Hello/, /[Ww]orld/])).toEqual(/((?:Hello|[Ww]orld))/);
  expect(capture(['Hello', /[Ww]orld/])).toEqual(/((?:Hello|[Ww]orld))/);
});

test('optional', () => {
  expect(optional('a')).toEqual(/a?/);

  expect(optional('World')).toEqual(/(?:World)?/);
  expect(optional(/World/)).toEqual(/(?:World)?/);

  expect(optional(['hello', 'world'])).toEqual(/(?:hello|world)?/);
  expect(optional([/Hello/, /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)?/);
  expect(optional(['Hello', /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)?/);
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
});

test('zeroOrMore', () => {
  expect(zeroOrMore('a')).toEqual(/a*/);

  expect(zeroOrMore('World')).toEqual(/(?:World)*/);
  expect(zeroOrMore(/World/)).toEqual(/(?:World)*/);

  expect(zeroOrMore(['hello', 'world'])).toEqual(/(?:hello|world)*/);
  expect(zeroOrMore([/Hello/, /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)*/);
  expect(zeroOrMore(['Hello', /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)*/);
});

test('flags', () => {
  expect(flags('World', 'gmi')).toEqual(/World/gim);
  expect(flags(/World/, 'i')).toEqual(/World/i);

  expect(flags(['hello', 'world'], 'g')).toEqual(/(?:hello|world)/g);
  expect(flags([/Hello/, /[Ww]orld/], 'm')).toEqual(/(?:Hello|[Ww]orld)/m);
  expect(flags(['Hello', /[Ww]orld/], 'i')).toEqual(/(?:Hello|[Ww]orld)/i);
});

test('repeat', () => {
  expect(repeat('a', 1)).toEqual(/a{1}/);
  expect(repeat(/a/, 2)).toEqual(/a{2}/);
  expect(repeat(/[abc]/, [3, 6])).toEqual(/[abc]{3,6}/);

  expect(repeat('World', 4)).toEqual(/(?:World){4}/);
  expect(repeat(/World/, [5, 7])).toEqual(/(?:World){5,7}/);
});

test('named', () => {
  expect(named('World', 'planet')).toEqual(/(?<planet>World)/);
  expect(named(/Hello/, 'greeting')).toEqual(/(?<greeting>Hello)/);

  expect(named(['hello', 'world'], 'greeting')).toEqual(
    /(?<greeting>(?:hello|world))/
  );
});

