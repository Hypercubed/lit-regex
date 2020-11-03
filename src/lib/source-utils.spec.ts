import { s_guaranteeAtomic, s_ignoreCase, s_isAtomic } from "./source-utils"

test(`atomic`, () => {
	expect(s_isAtomic('(what)')).toBe(true);
	expect(s_isAtomic('[what]')).toBe(true);
	expect(s_isAtomic('(who(what)when)')).toBe(true);
	expect(s_isAtomic('([what])')).toBe(true);
  expect(s_isAtomic('[(what)]')).toBe(true);
  expect(s_isAtomic('(?:what)')).toBe(true);

  expect(s_isAtomic('a')).toBe(true);
  expect(s_isAtomic('\\a')).toBe(true);
  expect(s_isAtomic('\\^')).toBe(true);

  expect(s_isAtomic('^')).toBe(true);  // ??
  expect(s_isAtomic('$')).toBe(true);  // ??
});

test(`non-atomic`, () => {
	expect(s_isAtomic('(what)*')).toBe(false);
	expect(s_isAtomic('[what][who]')).toBe(false);
	expect(s_isAtomic('when(who(what))')).toBe(false);
  expect(s_isAtomic('(ok)([what])')).toBe(false);
  expect(s_isAtomic('(?:what)(?:what)')).toBe(false);

  expect(s_isAtomic('aa')).toBe(false);
  expect(s_isAtomic('a(?:)a')).toBe(false);
  expect(s_isAtomic('a|b')).toBe(false);
  expect(s_isAtomic('what|who')).toBe(false);
  expect(s_isAtomic('\\\\a')).toBe(false);
});

test(`guaranteeAtomic`, () => {
  expect(s_guaranteeAtomic('what')).toBe('(?:what)');

	expect(s_guaranteeAtomic('(what)')).toBe('(what)');
	expect(s_guaranteeAtomic('[what]')).toBe('[what]');

  expect(s_guaranteeAtomic('(what)*')).toBe('(?:(what)*)');
	expect(s_guaranteeAtomic('[what][who]')).toBe('(?:[what][who])');
});

test(`ignoreCase`, () => {
  expect(s_ignoreCase('what')).toBe('[Ww][Hh][Aa][Tt]');
  expect(s_ignoreCase('wHaT')).toBe('[Ww][Hh][Aa][Tt]');

	expect(s_ignoreCase('(what)')).toBe('([Ww][Hh][Aa][Tt])');
	expect(s_ignoreCase('[what]')).toBe('[[Ww][Hh][Aa][Tt]]');  // ??

  expect(s_ignoreCase('(what)*')).toBe('([Ww][Hh][Aa][Tt])*');
	expect(s_ignoreCase('[what][who]')).toBe('[[Ww][Hh][Aa][Tt]][[Ww][Hh][Oo]]'); // ??
});