import { all } from './core';
import { regex } from './lit';
import { any, decimal, float, int, string, uint, word } from './regexps';

test('expressions', () => {
  expect(regex`Hello ${word}`).toEqual(/Hello \S+/);
  expect(regex`Hello ${uint}`).toEqual(/Hello \d+/);
  expect(regex`Hello ${int}`).toEqual(/Hello [\+\x2d]?\d+/); // eslint-disable-line no-useless-escape
  expect(regex`Hello ${decimal}`).toEqual(
    /Hello (?:[\+\x2d]?\d+|(?:[\+\x2d]?\d+)?\.\d+)/ // eslint-disable-line no-useless-escape
  );
  expect(regex`Hello ${float}`).toEqual(
    /Hello (?:[\+\x2d]?\d+|(?:[\+\x2d]?\d+)?\.\d+)(?:[Ee][\+\x2d]?\d+)?/ // eslint-disable-line no-useless-escape
  );
  expect(regex`Hello ${string}`).toEqual(/Hello (?:"[^"]*"|'[^']*')/);
  expect(regex`Hello ${any}`).toEqual(/Hello .*/);
});

test('uint', () => {
  expect(all(uint).test('3')).toBe(true);
  expect(all(uint).test('123')).toBe(true);

  expect(all(uint).test('-3')).toBe(false);
  expect(all(uint).test('+123')).toBe(false);

  expect(all(uint).test('4.2')).toBe(false);
  expect(all(uint).test('.34')).toBe(false);

  expect(all(uint).test('.4.2')).toBe(false);
  expect(all(uint).test('..34')).toBe(false);
  expect(all(uint).test('3..4')).toBe(false);
});

test('int', () => {
  expect(all(int).test('3')).toBe(true);
  expect(all(int).test('123')).toBe(true);

  expect(all(int).test('-3')).toBe(true);
  expect(all(int).test('+123')).toBe(true);

  expect(all(int).test('4.2')).toBe(false);
  expect(all(int).test('.34')).toBe(false);

  expect(all(int).test('.4.2')).toBe(false);
  expect(all(int).test('..34')).toBe(false);
  expect(all(int).test('3..4')).toBe(false);
});

test('decimal', () => {
  expect(all(decimal).test('3')).toBe(true);
  expect(all(decimal).test('123')).toBe(true);

  expect(all(decimal).test('-3')).toBe(true);
  expect(all(decimal).test('+123')).toBe(true);

  expect(all(decimal).test('4.2')).toBe(true);
  expect(all(decimal).test('.34')).toBe(true);

  expect(all(decimal).test('.4.2')).toBe(false);
  expect(all(decimal).test('..34')).toBe(false);
  expect(all(decimal).test('3..4')).toBe(false);
});

test('floats', () => {
  expect(all(float).test('3')).toBe(true);
  expect(all(float).test('123')).toBe(true);

  expect(all(float).test('-3')).toBe(true);
  expect(all(float).test('+123')).toBe(true);

  expect(all(float).test('4.2')).toBe(true);
  expect(all(float).test('.34')).toBe(true);

  expect(all(float).test('4.2e12')).toBe(true);
  expect(all(float).test('.34E-3')).toBe(true);

  expect(all(float).test('.4.2')).toBe(false);
  expect(all(float).test('..34')).toBe(false);
  expect(all(float).test('3..4')).toBe(false);
});
