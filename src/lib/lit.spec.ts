import { anyOf, avoid, capture, ignoreCase, lookAhead } from './core';
import { regex } from './lit';

test('strings and regex', () => {
  expect(regex`Hello`).toEqual(/Hello/);
  expect(regex`[Hh]ello`).toEqual(/\[Hh\]ello/);

  expect(regex`Hello ${'World'}`).toEqual(/Hello World/);
  expect(regex`Hello ${/World/}`).toEqual(/Hello World/);

  expect(regex`Hello ${'[Ww]orld'}`).toEqual(/Hello \[Ww\]orld/);
  expect(regex`Hello ${/[Ww]orld/}`).toEqual(/Hello [Ww]orld/);
});

test('arrays', () => {
  expect(regex`Hello (?:World|Earth)`).toEqual(/Hello \(\?:World\|Earth\)/);
  expect(regex`Hello ${'(?:World|Earth)'}`).toEqual(
    /Hello \(\?:World\|Earth\)/
  );

  expect(regex`Hello ${/(?:World|Earth)/}`).toEqual(/Hello (?:World|Earth)/);
  expect(regex`Hello ${['World', 'Earth']}`).toEqual(/Hello (?:World|Earth)/);
});

test('other regex', () => {
  expect(regex`^Hello\$`).toEqual(/\^Hello\$/);
  expect(regex`${/^Hello$/}`).toEqual(/^Hello$/);
  expect(regex`${/^/}Hello${/$/}`).toEqual(/^Hello$/);
});

test('ignoreCase', () => {
  expect(regex`Hello ${ignoreCase('World')}`).toEqual(
    /Hello [Ww][Oo][Rr][Ll][Dd]/
  );
});

test('anyOf', () => {
  expect(regex`Hello ${anyOf('World', 'Earth')}`).toEqual(
    /Hello (?:World|Earth)/
  );
});

test('avoid', () => {
  expect(regex`Hello ${avoid('World')}`).toEqual(/Hello (?!World)/);
  expect(regex`Hello ${avoid(/[Ww]orld/)}`).toEqual(/Hello (?![Ww]orld)/);
});

test('lookAhead', () => {
  expect(regex`Hello ${lookAhead('World')}`).toEqual(/Hello (?=World)/);
  expect(regex`Hello ${lookAhead(/[Ww]orld/)}`).toEqual(/Hello (?=[Ww]orld)/);
});

test('capture', () => {
  expect(regex`Hello ${capture('World')}`).toEqual(/Hello (World)/);
  expect(regex`Hello ${capture(/[Ww]orld/)}`).toEqual(/Hello ([Ww]orld)/);
});
