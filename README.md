# lit-regex

A RegExp templating library for JavaScript

## Overview

There are a few existing JavaScript tools for composing regular expressions (see, for example, [re-template-tag](https://github.com/rauschma/re-template-tag)).  However, all of these assume the users is writing primarily regex. There are many cases were most of the text will be plaintext requiring escaping. For example, if I wanted to match the string "Apples for $0.99 (per lb)" I would need the regexp `/Apples for \$0\.99 \(per lb\)/`.  Did you forget to escape anything?  Start trying to compose a regexp using strings and the problem is exasperated.

`lit-regex` lets you write readable regular expressions in JavaScript using [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals). `lit-regex` templates are plain text strings that allow embedded regular expressions for composability.

## Installation

```sh
npm i --save-dev lit-regex
```

## Usage

Expanding on the example above.  Suppose we want to match the string "XXX for $YY.YY (per lb)" were `XXX` can be "Apples" or "Oranges" (first letter case-insensitive) and `YY.YY` is any price.  Maybe you're sufficiently familiar with regular expressions to write:

```ts
const re = /We sell (?:[Aa]pples|[Oo]ranges) for \$\d+\.\d+ \(per lb\)/;
```

or in a composable form:

```ts
const int = /\d+/;
const price = `\\$${int.source}\\.${int.source}`;
const products = /(?:[Aa]pples|[Oo]ranges)/;
const re = new RegExp(`We sell ${products.source} for ${price} \\[each\\]\\.`);
```

Notice a few difficulties here:

* Since `int` and `products` are RegExp objects we need to use `.source` to get the source regexp.
* Exact t test matches need to be escaped.
* Regular expressions within the string need to be double escaped.

Using `lit-regex` we could write:

```js
import { regex } from 'lit-regex';

const int = /\d+/;
const price = regex`$${int}.${int}`;
const products = [/[Aa]pples/, /[Oo]ranges/];
const re = regex`We sell ${products} for ${price} [each].`;
```

A few simple rules to notice:

* If an expression is a string, it is escaped for literal matching; this includes the static potions of the template string.
* If an expression is a `RegExp`, the regular expression i embeded as a substring match (flags are ignored).
* If an expression is an Array, it is treated as an alternation (OR operand) and each item within the array are treated with these same rules.

## Functional API

Most of the power of `lit-regex` is in the `regex` template tag; which is effectively sugar for a set of composable functional tools for building regular expressions.  These functions can be used to alone to compose regular expressions or within `regex` template tags.  These functions, in general, follow the same the rules listed above again:

* String are treated as literals.
* RegExps are treated as a regular expression.
* Arrays are treated as a to a alternation.

The example above could be rewritten using the composition functions:

```js
import { seq } from 'lit-regex';

const int = /\d+/;
const price = seq('$', int, '.', int);
const products = anyOf(/[Aa]pples/, /[Oo]ranges/);
const re = seq('We sell ', products, ' for ', price, ' [each].');
```

or a combination of functions and string literals:

```js
import { seq } from 'lit-regex';

const int = /\d+/;
const price = seq('$', int, '.', int);
const products = anyOf(/[Aa]pples/, /[Oo]ranges/);
const re = regex`We sell ${products} for ${price} [each].`;
```

Each function is explained below:

### `seq(...arg)`

Each argument is treated by the expression rules listed above and combined into a RegExp sequence.

```js
seq('a', /b|c/);
// same as /a(?:b|c)/
```

### `anyOf(...arg)`

Each argument is treated by the expression rules listed above and combined into a RegExp alternation.

```js
anyOf('Hello', /[Ww]orld/);
// same as /(?:Hello|[Ww]orld)/
```

### `group(arg)`

The single argument is treated according to the expression rules listed above and returned in a non-capturing group.

```js
group('Hello');
// same as /(?:Hello)/

group(/[Ww]orld/);
// same as /(?:[Ww]orld)/
```

### `lookAhead(arg)`

The single argument is treated according to the expression rules listed above and returned in a look-ahead group.

```js
lookAhead('Hello');
// same as /(?=Hello)/

lookAhead(/[Ww]orld/);
// same as /(?=[Ww]orld)/

lookAhead([/Hello/, /[Ww]orld/]);
// same as /(?=(?:Hello|[Ww]orld))/
```

### `capture(arg)`

The single argument is treated according to the expression rules listed above and returned in a capture group.

```js
capture('Hello');
// same as /(Hello)/

capture(/[Ww]orld/);
// same as /([Ww]orld)/

lookAhead(['Hello', /[Ww]orld/]);
// same as /((?:Hello|[Ww]orld))/
```

### `avoid(arg)`

The single argument is treated according to the expression rules listed above and returned in a negative lookahead.

```js
avoid('Hello');
// same as /(?!Hello)/

avoid(/[Ww]orld/);
// same as /(?![Ww]orld)/

avoid(['Hello', /[Ww]orld/]);
// same as /(?!(?:Hello|[Ww]orld))/
```

### `optional(arg)`

The single argument is treated according to the expression rules listed above and returned in a optional group.

```js
avoid('Hello');
// same as /(?:Hello)?/

avoid(/[Ww]orld/);
// same as /(?:[Ww]orld)?/

avoid(['Hello', /[Ww]orld/]);
// same as /(?:(?:Hello|[Ww]orld))?/
```

### `oneOrMore(arg)`

```js
oneOrMore('Hello');
// same as /(?:Hello)+/

oneOrMore(/[Ww]orld/);
// same as /(?:[Ww]orld)+/

oneOrMore(['Hello', /[Ww]orld/]);
// same as /(?:(?:Hello|[Ww]orld))+/
```

### `oneOrMore(arg)`

```js
zeroOrMore('Hello');
// same as /(?:Hello)*/

zeroOrMore(/[Ww]orld/);
// same as /(?:[Ww]orld)*/

zeroOrMore(['Hello', /[Ww]orld/]);
// same as /(?:(?:Hello|[Ww]orld))*/
```

## More examples

### email

```js
import { regex, oneOrMore, repeat } from 'lit-regex';

const localPart = oneOrMore(/[a-zA-Z0-9._%-]/);
const domainPart = oneOrMore(/[a-zA-Z0-9.-]/);
const tld = repeat(/[a-zA-Z]/, [2, 24]);

const re = regex`${localPart}@${domainPart).${tld}`;

// same as /[a-zA-Z\d\.-_]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,24}/
```

### URL

```js
import { regex, oneOrMore, repeat } from 'lit-regex';

const scheme = ['http', 'https', 'ftp'];
const sub = 'www.';
const sld = repeat(/[-a-zA-Z0-9@:%._\+~#=]/, [2, 256]);
const domainPart = oneOrMore(/[a-zA-Z0-9.-]/);
const tld = repeat(/[a-zA-Z]/, [2, 24]);

const re = regex`${scheme}://${optional(sub)}${domainPart).${tld}`;
```

### Dates with named capture

```js
import { regex, oneOrMore, repeat } from 'lit-regex';

const year = repeat(/\d/, 4);
const month = repeat(/\d/, 2);
const day = repeat(/\d/, 2);
const date = regex`${named(year, 'year')}-${named(month, 'month')}-${named(day, 'day')}`;
```

## Credits and alternatives

The composable RegExp API inspired by [/compose-regexp.js](https://github.com/pygy/compose-regexp.js).  Regular expressions via template tag inspired by [lit-html](https://lit-html.polymer-project.org/) and [re-template-tag](https://2ality.com/2017/07/re-template-tag.html).

## License

This project is licensed under the MIT License - see the LICENSE file for details
