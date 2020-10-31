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

Expanding on the example above.  Suppose we want to match the string "XXX for $YY.YY (per lb)" were `XXX` can be "Apples" or "Oranges" (first letter case insensitive) and `YY.YY` and be any price.  Maybe you're sufficiently familiar with regular expressions to write:

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
* You need to remember what characters need to be escaped.
* Look at all the horrible double escaping!

Using `lit-regex` we could write:

```ts
import { regex } from "./lit";

const int = /\d+/;
const price = regex`$${int}.${int}`;
const products = [/[Aa]pples/, /[Oo]ranges/];
const re = regex`We sell ${products} for ${price} [each].`;
```

A few simple rules to notice:

* The static potions of the template is treated like plain text and properly escaped for the final regular expression.
* When using embed expressions we follow three rules:
  1. If the expression is a string, it is escaped.
  2. If the value is a RegExp, the regular expression source is extracted.
  3. If the value is an Array, it is treated as a to a alternation (OR operand) and each item within the array are treated with the same rules.

## API Details

Most of the power of `lit-regex` is in the `regex` template tag; which is effectively sugar for a set of composable functional tools for building regular expressions.  These functional tools can also be used to enhance the template tag.  Each function is explained below:

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
// same as /(Hello)/

group(/[Ww]orld/);
// same as /([Ww]orld)/
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

## Credits and alternatives

The composable RegExp API inspired by [/compose-regexp.js](https://github.com/pygy/compose-regexp.js).  Regular expressions via template tag inspired by [lit-html](https://lit-html.polymer-project.org/) and [re-template-tag](https://2ality.com/2017/07/re-template-tag.html).

## License

This project is licensed under the MIT License - see the LICENSE file for details
