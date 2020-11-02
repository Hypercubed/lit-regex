import { anyOf, avoid, capture, ignoreCase, ahead } from './core';
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

test('ahead', () => {
  expect(regex`Hello ${ahead('World')}`).toEqual(/Hello (?=World)/);
  expect(regex`Hello ${ahead(/[Ww]orld/)}`).toEqual(/Hello (?=[Ww]orld)/);
});

test('capture', () => {
  expect(regex`Hello ${capture('World')}`).toEqual(/Hello (World)/);
  expect(regex`Hello ${capture(/[Ww]orld/)}`).toEqual(/Hello ([Ww]orld)/);
});

test('ignore case', () => {
  expect(regex`Hello ${ignoreCase('World')}`).toEqual(
    /Hello [Ww][Oo][Rr][Ll][Dd]/
  );
  expect(regex`Hello ${ignoreCase(/world/)}`).toEqual(
    /Hello [Ww][Oo][Rr][Ll][Dd]/
  );
  expect(regex`Hello ${/world/i}`).toEqual(/Hello [Ww][Oo][Rr][Ll][Dd]/);

  expect(regex`${/World/i}`).toEqual(/World/i);
  expect(regex`${ignoreCase('World')}`).toEqual(/World/i);
});

test('returns a clone', () => {
  const re = /World/;
  expect(regex`${re}`).toEqual(re);
  expect(regex`${re}`).not.toBe(re);
});
