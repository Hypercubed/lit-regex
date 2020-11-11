# lit-regex

Template literals regular expressions for JavaScript

## Overview

There are a few existing JavaScript tools for composing regular expressions (see, for example, [re-template-tag](https://github.com/rauschma/re-template-tag) and [regexp-make-js](https://github.com/mikesamuel/regexp-make-js)).  However, all of these assume the users is writing primarily regex, treating literal strings as an afterthought.  There are many cases were most of the text will be plaintext which may require escaping.  For example, if I wanted to match the string "Apples for $0.99 (per lb)" I would need the regular expression `/Apples for \$0\.99 \[per #\]/`.  Did I forget to escape anything?  Start trying to compose a regex using strings and the problem is exasperated.

`lit-regex` lets you compose coherent regular expressions in JavaScript using [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals). `lit-regex` templates are plain text strings that allow embedded regular expressions for composability.

## Installation

```sh
npm i lit-regex
```

## Usage

Expanding on the example above; suppose we want to match the string "We sell (XXX) for $YY.YY [per #]" were `XXX` can be `/apples/i` or `/oranges/i` (case-insensitive) inside a named capture group and `YY.YY` is any price inside.  Maybe you're sufficiently familiar with regular expressions to write:

```ts
const re = /We sell (?<products>(?:[Aa][Pp][Pp][Ll][Ee][Ss]|[Oo][Rr][Aa][Nn][Gg][Ee][Ss])) for \$\d+\.\d{2} \[per #\]\./;
```

Not exactly readable.  Not lets try doing the same via composition:

```ts
const digit = /\d/;
const price = `\\$${digit.source}+\\.${digit.source}{2}`;
const products = /(?:[Aa][Pp][Pp][Ll][Ee][Ss]|[Oo][Rr][Aa][Nn][Gg][Ee][Ss])/;
const re = new RegExp(`We sell (?<products>${products.source}) for ${price} \\[per #\\]\\.`);
```

Notice a few difficulties here:

* Since `digit` and `products` are RegExp objects we need to use `.source` to get the source regexp.
* Making `products` case insensitive is a pain.
* Named capture groups decrease readability and appear redundant.
* Exact text matches need to be escaped.
* Regular expressions within a string need to be double escaped.

Using `lit-regex` we could write:

```js
import { regex, oneOrMore, repeat } from 'lit-regex';

const digit = /\d/;
const price = regex`$${oneOrMore(digit)}.${repeat(digit, 2)}`;
const products = [/apples/i, /oranges/i];
const re = regex`We sell ${{ products }} for ${price} [per #].`;
// same as /We sell (?<products>(?:[Aa][Pp][Pp][Ll][Ee][Ss]|[Oo][Rr][Aa][Nn][Gg][Ee][Ss])) for \$\d+\.\d{2} \[per #\]\./;
```

A few rules to notice:

* If an expression is a `RegExp`, the regular expression is embedded as a substring match (`i` flag is preserved or converted to inline case-insensitive).
* If an expression is an `Array`, it is treated as an alternation (OR operand) and each item within the array is treated with these same rules.
* If an expression is an object with one key, it is treated as a capture group where the key is the name (keys prefixed with a `$` are unnamed) and the value is treated with these same rules.
* All other expressions (strings and numbers) are escaped for literal matching; this includes the static portions of the template string.

While the ignore case flag (`i`) is propagated during composition; other flags are ignored.  To set flags on `regex` output use the following syntax:

```js
regex.gi`Hello World`;
// same as /Hello World/gi

regex.m`${/^/}Hello World${/$/}`;
// same as /^Hello World$/m
```

## Functional API

Most of the power of `lit-regex` is in the `regex` template tag; which is, effectively, sugar for a set of composable functions for building regular expressions.  These functions can be used by themselves to compose regular expressions or within `regex` template tag expressions.  These functions, in general, follow the same the rules listed above; again:

* `RegExp`s are treated as a regular expression.
* Arrays are treated as an alternation.
* Objects are capture groups.
* Everything else is escaped for a literal match.

The example above can be rewritten using the composition functions:

```js
import { seq, oneOrMore, repeat, anyOf, capture } from 'lit-regex';

const digit = /\d/;
const price = seq('$', oneOrMore(digit), '.', repeat(digit, 2));
const products = anyOf(/apples/i, /oranges/i);
const re = seq('We sell ', capture(products, 'products'), ' for ', price, ' [per #].');
```

or a combination of functions and tagged templates:

```js
import { regex, seq, oneOrMore, repeat, anyOf } from 'lit-regex';

const digit = /\d/;
const price = seq('$', oneOrMore(digit), '.', repeat(digit, 2));
const products = anyOf(/apples/i, /oranges/i);
const re = regex`We sell ${{products}} for ${price} [per #].`;
```

Each function is explained below:

### `seq(...arg)`

Each argument is treated by the expression rules listed above and combined into a RegExp sequence.

```js
seq('a', 'b', /c/);
// same as /abc/

seq('Hello', ' ', /[Ww]orld/)
// same as /Hello [Ww]orld/

seq('Hello', ' ', [/[Ww]orld/, 'Earth'])
// same as /Hello (?:[Ww]orld|Earth)/
```

### `anyOf(...arg)`

Each argument is treated by the expression rules listed above and combined into a RegExp alternation.

```js
anyOf('a', 'b', /c/)
// same as /[abc]/

anyOf(/[Ww]orld/, 'Earth')
// same as /(?:[Ww]orld|Earth)/
```

### `ahead(arg)`

The single argument is treated according to the expression rules listed above and returned in a look-ahead group.

```js
ahead('Hello');
// same as /(?=Hello)/

ahead(/[Ww]orld/);
// same as /(?=[Ww]orld)/

ahead([/Hello/, /[Ww]orld/]);
// same as /(?=(?:Hello|[Ww]orld))/
```

### `capture(arg, name?)`

The first argument is treated according to the expression rules listed above and returned in a capture group.  The second argument (if provided) is a name for generating named capture groups. 

```js
capture('Hello');
// same as /(Hello)/

capture(/[Ww]orld/);
// same as /([Ww]orld)/

capture(['Hello', /[Ww]orld/], 'greeting');
// same as /(?<greeting>(?:Hello|[Ww]orld))/
```

### `avoid(arg)`

The single argument is treated according to the expression rules listed above and returned in a negative ahead.

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
// same as /(?:Hello|[Ww]orld)?/
```

### `oneOrMore(arg)`

```js
oneOrMore('Hello');
// same as /(?:Hello)+/

oneOrMore(/[Ww]orld/);
// same as /(?:[Ww]orld)+/

oneOrMore(['Hello', /[Ww]orld/]);
// same as /(?:Hello|[Ww]orld)+/
```

### `zeroOrMore(arg)`

```js
zeroOrMore('Hello');
// same as /(?:Hello)*/

zeroOrMore(/[Ww]orld/);
// same as /(?:[Ww]orld)*/

zeroOrMore(['Hello', /[Ww]orld/]);
// same as /(?:Hello|[Ww]orld)*/
```

### `repeat(arg, N?)`

```js
repeat('Hello', 2);
// same as /(?:Hello){2}/

repeat(/[Ww]orld/, [2, 3]);
// same as /(?:[Ww]orld){2,3}/

repeat(['Hello', /[Ww]orld/], [5, Infinity]);
// same as /(?:Hello|[Ww]orld){5,}/
```

## More examples

### email

```js
import { regex, oneOrMore, repeat } from 'lit-regex';

const localPart = oneOrMore(/[a-zA-Z0-9._%-]/);
const domainPart = oneOrMore(/[a-zA-Z0-9.-]/);
const tld = repeat(/[a-zA-Z]/, [2, 24]);

const re = regex`${localPart}@${domainPart}.${tld}`;
// same as /[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}/
```

### URL

```js
import { regex, oneOrMore, repeat } from 'lit-regex';

const scheme = ['http', 'https', 'ftp'];
const sub = 'www.';
const domainPart = repeat(/[a-zA-Z0-9.-]/, [2, 256]);
const tld = repeat(/[a-zA-Z]/, [2, 24]);
a
const re = regex`${scheme}://${optional(sub)}${domainPart}.${tld}`;
// same as /(?:http|https|ftp):\/\/(?:www\.)?[a-zA-Z0-9.-]{2,256}\.[a-zA-Z]{2,24}/
```

### Dates with named capture

```js
import { regex, oneOrMore, repeat } from 'lit-regex';

const year = repeat(/\d/, 4);
const month = repeat(/\d/, 2);
const day = repeat(/\d/, 2);
const date = regex`${{ year }}-${{ month }}-${{ day }}`;
// same as /(?<year>\d{4})\x2d(?<month>\d{2})\x2d(?<day>\d{2})/
```

## Credits and alternatives

The composable RegExp functional API inspired by [compose-regexp.js](https://github.com/pygy/compose-regexp.js).  Composable regular expressions via template tags inspired by [lit-html](https://lit-html.polymer-project.org/) and [Easy Dynamic Regular Expressions with Tagged Template Literals and Proxies](https://lea.verou.me/2018/06/easy-dynamic-regular-expressions-with-tagged-template-literals-and-proxies/).

## License

This project is licensed under the MIT License - see the LICENSE file for details
