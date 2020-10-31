import {
  all,
  anyOf,
  avoid,
  capture,
  flags,
  ignoreCase,
  lookAhead,
  optional,
  seq,
} from './core';

test('seq', () => {
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
});

test('ignoreCase', () => {
  expect(ignoreCase('WoRld')).toEqual(/[Ww][Oo][Rr][Ll][Dd]/);

  expect(ignoreCase('WoRld').test('world')).toBe(true);
});

test('anyOf', () => {
  expect(anyOf('Hello', 'World')).toEqual(/(?:Hello|World)/);
  expect(anyOf('Hello', 'World', 'Earth')).toEqual(/(?:Hello|World|Earth)/);

  expect(anyOf('Hello', 'World')).toEqual(/(?:Hello|World)/);
  expect(anyOf(/Hello/, /[Ww]orld/)).toEqual(/(?:Hello|[Ww]orld)/);
  expect(anyOf('Hello', /[Ww]orld/)).toEqual(/(?:Hello|[Ww]orld)/);
});

test('avoid', () => {
  expect(avoid('World')).toEqual(/(?!World)/);

  expect(avoid('a')).toEqual(/[^a]/);
  expect(avoid('ab')).toEqual(/(?!ab)/);
  expect(avoid('abc')).toEqual(/(?!abc)/);

  expect(avoid(/a/)).toEqual(/(?!a)/); // TODO: /[^a]/
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
  expect(optional('World')).toEqual(/(?:World)?/);
  expect(optional(/World/)).toEqual(/(?:World)?/);

  expect(optional(['hello', 'world'])).toEqual(/(?:(?:hello|world))?/);
  expect(optional([/Hello/, /[Ww]orld/])).toEqual(/(?:(?:Hello|[Ww]orld))?/);
  expect(optional(['Hello', /[Ww]orld/])).toEqual(/(?:(?:Hello|[Ww]orld))?/);
});

test('all', () => {
  expect(all('World')).toEqual(/^World$/);
  expect(all(/World/)).toEqual(/^World$/);

  expect(all(['hello', 'world'])).toEqual(/^(?:hello|world)$/);
  expect(all([/Hello/, /[Ww]orld/])).toEqual(/^(?:Hello|[Ww]orld)$/);
  expect(all(['Hello', /[Ww]orld/])).toEqual(/^(?:Hello|[Ww]orld)$/);
});

test('flags', () => {
  expect(flags('World', 'gmi')).toEqual(/World/gim);
  expect(flags(/World/, 'i')).toEqual(/World/i);

  expect(flags(['hello', 'world'], 'g')).toEqual(/(?:hello|world)/g);
  expect(flags([/Hello/, /[Ww]orld/], 'm')).toEqual(/(?:Hello|[Ww]orld)/m);
  expect(flags(['Hello', /[Ww]orld/], 'i')).toEqual(/(?:Hello|[Ww]orld)/i);
});
