import {
  ahead,
  anyOf,
  avoid,
  capture,
  oneOrMore,
  optional,
  regex,
  repeat,
  seq,
  zeroOrMore,
} from '.';

const x = /We sell (?<products>(?:[Aa][Pp][Pp][Ll][Ee][Ss]|[Oo][Rr][Aa][Nn][Gg][Ee][Ss])) for \$\d+\.\d{2} \[per #\]\./;

test('Usage without regex', () => {
  const digit = /\d/;
  const price = `\\$${digit.source}+\\.${digit.source}{2}`;
  const products = /(?:[Aa][Pp][Pp][Ll][Ee][Ss]|[Oo][Rr][Aa][Nn][Gg][Ee][Ss])/;
  const re = new RegExp(
    `We sell (?<products>${products.source}) for ${price} \\[per #\\]\\.`
  );
  expect(re).toEqual(x);
});

test('Usage with regex', () => {
  const digit = /\d/;
  const price = regex`$${oneOrMore(digit)}.${repeat(digit, 2)}`;
  const products = [/apples/i, /oranges/i];
  const re = regex`We sell ${{ products }} for ${price} [per #].`;
  expect(re).toEqual(x);
});

test('flags usage', () => {
  expect(regex.gi`Hello World`).toEqual(/Hello World/gi);
  expect(regex.m`${/^/}Hello World${/$/}`).toEqual(/^Hello World$/m);
});

test('Functional API', () => {
  const digit = /\d/;
  const price = seq('$', oneOrMore(digit), '.', repeat(digit, 2));
  const products = anyOf(/apples/i, /oranges/i);
  const re = seq(
    'We sell ',
    capture(products, 'products'),
    ' for ',
    price,
    ' [per #].'
  );
  expect(re).toEqual(x);
});

test('Functional API with regex', () => {
  const digit = /\d/;
  const price = seq('$', oneOrMore(digit), '.', repeat(digit, 2));
  const products = anyOf(/apples/i, /oranges/i);
  const re = regex`We sell ${{ products }} for ${price} [per #].`;
  expect(re).toEqual(x);
});

test('seq', () => {
  expect(seq('a', 'b', /c/)).toEqual(/abc/);

  expect(seq('Hello', ' ', /[Ww]orld/)).toEqual(/Hello [Ww]orld/);

  expect(seq('Hello', ' ', [/[Ww]orld/, 'Earth'])).toEqual(
    /Hello (?:[Ww]orld|Earth)/
  );
});

test('anyOf', () => {
  expect(anyOf('a', 'b', /c/)).toEqual(/[abc]/);

  expect(anyOf(/[Ww]orld/, 'Earth')).toEqual(/(?:[Ww]orld|Earth)/);
});

test('ahead', () => {
  expect(ahead('Hello')).toEqual(/(?=Hello)/);

  expect(ahead(/[Ww]orld/)).toEqual(/(?=[Ww]orld)/);

  expect(ahead([/Hello/, /[Ww]orld/])).toEqual(/(?=(?:Hello|[Ww]orld))/);
});

test('capture', () => {
  expect(capture('Hello')).toEqual(/(Hello)/);

  expect(capture(/[Ww]orld/)).toEqual(/([Ww]orld)/);

  expect(capture([/Hello/, /[Ww]orld/], 'greeting')).toEqual(
    /(?<greeting>(?:Hello|[Ww]orld))/
  );
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

  expect(repeat([/Hello/, /[Ww]orld/], [5, Infinity])).toEqual(
    /(?:Hello|[Ww]orld){5,}/
  );
});

test('email example', () => {
  const localPart = oneOrMore(/[a-zA-Z0-9._%-]/);
  const domainPart = oneOrMore(/[a-zA-Z0-9.-]/);
  const tld = repeat(/[a-zA-Z]/, [2, 24]);

  const re = regex`${localPart}@${domainPart}.${tld}`;

  expect(re).toEqual(/[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}/);
});

test('url example', () => {
  const scheme = ['http', 'https', 'ftp'];
  const sub = 'www.';
  const domainPart = repeat(/[a-zA-Z0-9.-]/, [2, 256]);
  const tld = repeat(/[a-zA-Z]/, [2, 24]);

  const re = regex`${scheme}://${optional(sub)}${domainPart}.${tld}`;

  expect(re).toEqual(
    /(?:http|https|ftp):\/\/(?:www\.)?[a-zA-Z0-9.-]{2,256}\.[a-zA-Z]{2,24}/
  );
});

test('date example', () => {
  const year = repeat(/\d/, 4);
  const month = repeat(/\d/, 2);
  const day = repeat(/\d/, 2);

  const date = regex`${{ year }}-${{ month }}-${{ day }}`;
  expect(date).toEqual(/(?<year>\d{4})\x2d(?<month>\d{2})\x2d(?<day>\d{2})/);
});
