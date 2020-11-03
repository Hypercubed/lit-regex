import XRegExp from 'xregexp';

import { ahead, anyOf, avoid, capture, ignoreCase } from './core';
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
  expect(regex`Hello ${[/World/, 'Earth']}`).toEqual(/Hello (?:World|Earth)/);
  expect(regex`Hello ${[/World/i, 'Earth']}`).toEqual(
    /Hello (?:[Ww][Oo][Rr][Ll][Dd]|Earth)/
  );

  expect(regex`Hello ${[/World/i, /Earth/i]}`).toEqual(
    /Hello (?:[Ww][Oo][Rr][Ll][Dd]|[Ee][Aa][Rr][Tt][Hh])/
  );
  expect(regex`${[/World/i, /Earth/i]}`).toEqual(/(?:World|Earth)/i);
});

test('objects', () => {
  expect(regex`Hello ${{ planet: 'World' }}`).toEqual(/Hello (?<planet>World)/);
  expect(regex`Hello ${{ planet: ['World', 'Earth'] }}`).toEqual(
    /Hello (?<planet>(?:World|Earth))/
  );
  expect(regex`Hello ${{ world: 'World', earth: 'Earth' }}`).toEqual(
    /Hello (?:(?<world>World)|(?<earth>Earth))/
  );

  expect(regex`Hello ${{ planet: [/World/, /Earth/] }}`).toEqual(
    /Hello (?<planet>(?:World|Earth))/
  );
  expect(regex`Hello ${{ planet: [/World/i, /Earth/i] }}`).toEqual(
    /Hello (?<planet>(?:[Ww][Oo][Rr][Ll][Dd]|[Ee][Aa][Rr][Tt][Hh]))/
  );

  const planet = /World/;
  expect(regex`Hello ${{ planet }}`).toEqual(/Hello (?<planet>World)/);

  const planet2 = /World/i;
  expect(regex`Hello ${{ planet2 }}`).toEqual(
    /Hello (?<planet2>[Ww][Oo][Rr][Ll][Dd])/
  );
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

test('flags', () => {
  expect(regex.i`World`).toEqual(/World/i);
  expect(regex.imu`World`).toEqual(/World/imu);
});

test('invalid flags', () => {
  const re = /World/;
  expect(() => {
    regex.x`${re}`;
  }).toThrow(`SyntaxError: Invalid flags supplied to regex 'x'`);

  expect(() => {
    regex.igz`${re}`;
  }).toThrow(`SyntaxError: Invalid flags supplied to regex 'igz'`);
});

test('function props still exist', () => {
  expect(regex.name).toEqual('regex');
});

test('works with xregexp', () => {
  const x = (source: string) => {
    return XRegExp(source, 'x');
  };

  expect(regex`Hello ${x(`world`)}`).toEqual(/Hello world/);

  expect(
    regex`${x(`
    Hello # a greeting
    world # a place
  `)}`
  ).toEqual(/Hello(?:)world(?:)/);
});
