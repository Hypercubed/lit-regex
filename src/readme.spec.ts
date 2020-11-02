import {
  anyOf,
  avoid,
  capture,
  ahead,
  oneOrMore,
  optional,
  regex,
  repeat,
  seq,
  zeroOrMore,
} from '.';

const x = /We sell (?:[Aa][Pp][Pp][Ll][Ee][Ss]|[Oo][Rr][Aa][Nn][Gg][Ee][Ss]) for \$\d+\.\d{2} \[per #\]\./;

test('Usage without regex', () => {
  const digit = /\d/;
  const price = `\\$${digit.source}+\\.${digit.source}{2}`;
  const products = /(?:[Aa][Pp][Pp][Ll][Ee][Ss]|[Oo][Rr][Aa][Nn][Gg][Ee][Ss])/;
  const re = new RegExp(
    `We sell ${products.source} for ${price} \\[per #\\]\\.`
  );
  expect(re).toEqual(x);
});

test('Usage with regex', () => {
  const digit = /\d/;
  const price = regex`$${oneOrMore(digit)}.${repeat(digit, 2)}`;
  const products = [/apples/i, /oranges/i];
  const re = regex`We sell ${products} for ${price} [per #].`;
  expect(re).toEqual(x);
});

test('Functional API', () => {
  const digit = /\d/;
  const price = seq('$', oneOrMore(digit), '.', repeat(digit, 2));
  const products = anyOf(/apples/i, /oranges/i);
  const re = seq('We sell ', products, ' for ', price, ' [per #].');
  expect(re).toEqual(x);
});

test('Functional API with regex', () => {
  const digit = /\d/;
  const price = seq('$', oneOrMore(digit), '.', repeat(digit, 2));
  const products = anyOf(/apples/i, /oranges/i);
  const re = regex`We sell ${products} for ${price} [per #].`;
  expect(re).toEqual(x);
});

test('seq', () => {
  expect(seq('a', /b|c/)).toEqual(/a(?:b|c)/);
});

test('anyOf', () => {
  expect(anyOf('Hello', /[Ww]orld/)).toEqual(/(?:Hello|[Ww]orld)/);
});

test('ahead', () => {
  expect(ahead('Hello')).toEqual(/(?=Hello)/);

  expect(ahead(/[Ww]orld/)).toEqual(/(?=[Ww]orld)/);

  expect(ahead([/Hello/, /[Ww]orld/])).toEqual(/(?=(?:Hello|[Ww]orld))/);
});

test('capture', () => {
  expect(capture('Hello')).toEqual(/(Hello)/);

  expect(capture(/[Ww]orld/)).toEqual(/([Ww]orld)/);

  expect(capture([/Hello/, /[Ww]orld/])).toEqual(/((?:Hello|[Ww]orld))/);
});

test('avoid', () => {
  expect(avoid('Hello')).toEqual(/(?!Hello)/);

  expect(avoid(/[Ww]orld/)).toEqual(/(?![Ww]orld)/);

  expect(avoid([/Hello/, /[Ww]orld/])).toEqual(/(?!(?:Hello|[Ww]orld))/);
});

test('optional', () => {
  expect(optional('Hello')).toEqual(/(?:Hello)?/);

  expect(optional(/[Ww]orld/)).toEqual(/(?:[Ww]orld)?/);

  expect(optional([/Hello/, /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)?/);
});

test('oneOrMore', () => {
  expect(oneOrMore('Hello')).toEqual(/(?:Hello)+/);

  expect(oneOrMore(/[Ww]orld/)).toEqual(/(?:[Ww]orld)+/);

  expect(oneOrMore([/Hello/, /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)+/);
});

test('zeroOrMore', () => {
  expect(zeroOrMore('Hello')).toEqual(/(?:Hello)*/);

  expect(zeroOrMore(/[Ww]orld/)).toEqual(/(?:[Ww]orld)*/);

  expect(zeroOrMore([/Hello/, /[Ww]orld/])).toEqual(/(?:Hello|[Ww]orld)*/);
});

test('repeat', () => {
  expect(repeat('Hello', 2)).toEqual(/(?:Hello){2}/);

  expect(repeat(/[Ww]orld/, [2, 3])).toEqual(/(?:[Ww]orld){2,3}/);

  expect(repeat([/Hello/, /[Ww]orld/], 5)).toEqual(/(?:Hello|[Ww]orld){5}/);
});
