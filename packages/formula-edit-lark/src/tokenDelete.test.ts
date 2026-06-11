import { describe, expect, it } from 'vitest';
import { getAtomicArrowPos, getAtomicArrowPosWithSelection, getAtomicDeleteRange, isAtomicSegmentActive, snapSelectionOutOfAtomicSegments } from './core/token-delete';
import { SYNTAX_MUSTACHE } from './core/syntax';
import { demoFields, demoMethods } from './core/test-fixtures';

const tableNames = ['库存表'];

describe('tokenDelete', () => {
  const text = 'ROUND({{单价}}*{{数量}},2)';

  it('deletes entire field token on backspace after pill', () => {
    const pos = text.indexOf('{{数量}}') + '{{数量}}'.length;
    expect(getAtomicDeleteRange(text, pos, pos, 'Backspace', demoFields, demoMethods, SYNTAX_MUSTACHE)).toEqual({
      start: text.indexOf('{{数量}}'),
      end: pos,
    });
  });

  it('deletes entire field token on backspace inside pill', () => {
    const start = text.indexOf('{{单价}}');
    const pos = start + 2;
    expect(getAtomicDeleteRange(text, pos, pos, 'Backspace', demoFields, demoMethods, SYNTAX_MUSTACHE)).toEqual({
      start,
      end: start + '{{单价}}'.length,
    });
  });

  it('deletes entire field token on delete before pill', () => {
    const start = text.indexOf('{{数量}}');
    expect(getAtomicDeleteRange(text, start, start, 'Delete', demoFields, demoMethods, SYNTAX_MUSTACHE)).toEqual({
      start,
      end: start + '{{数量}}'.length,
    });
  });

  it('does not expand plain text delete', () => {
    const pos = text.indexOf('*') + 1;
    expect(
      getAtomicDeleteRange(text, pos, pos, 'Backspace', demoFields, demoMethods, SYNTAX_MUSTACHE),
    ).toBeNull();
  });

  it('expands selection spanning field token', () => {
    const fieldStart = text.indexOf('{{单价}}');
    const fieldEnd = fieldStart + '{{单价}}'.length;
    expect(
      getAtomicDeleteRange(
        text,
        fieldStart + 1,
        fieldEnd - 1,
        'Backspace',
        demoFields,
        demoMethods,
        SYNTAX_MUSTACHE,
      ),
    ).toEqual({ start: fieldStart, end: fieldEnd });
  });

  it('deletes table token atomically', () => {
    const tableText = '{{库存表}}.x';
    const tableEnd = '{{库存表}}'.length;
    expect(
      getAtomicDeleteRange(
        tableText,
        tableEnd,
        tableEnd,
        'Backspace',
        demoFields,
        demoMethods,
        SYNTAX_MUSTACHE,
        tableNames,
      ),
    ).toEqual({ start: 0, end: tableEnd });
  });

  it('skips field token on arrow right', () => {
    const text = 'IF({{单价}}>0,1)';
    const tokenStart = text.indexOf('{{单价}}');
    const tokenEnd = tokenStart + '{{单价}}'.length;
    expect(
      getAtomicArrowPos(text, tokenStart, 'ArrowRight', demoFields, demoMethods, SYNTAX_MUSTACHE),
    ).toBe(tokenEnd);
    expect(
      getAtomicArrowPos(text, tokenStart + 2, 'ArrowRight', demoFields, demoMethods, SYNTAX_MUSTACHE),
    ).toBe(tokenEnd);
  });

  it('moves past field token on arrow right at pill end', () => {
    const text = 'IF({{单价}}>0,1)';
    const tokenEnd = text.indexOf('{{单价}}') + '{{单价}}'.length;
    expect(
      getAtomicArrowPos(text, tokenEnd, 'ArrowRight', demoFields, demoMethods, SYNTAX_MUSTACHE),
    ).toBe(tokenEnd + 1);
  });

  it('moves past fully selected field token on arrow right', () => {
    const text = 'IF({{单价}}>0,1)';
    const tokenStart = text.indexOf('{{单价}}');
    const tokenEnd = tokenStart + '{{单价}}'.length;
    expect(
      getAtomicArrowPosWithSelection(
        text,
        tokenStart,
        tokenEnd,
        'ArrowRight',
        demoFields,
        demoMethods,
        SYNTAX_MUSTACHE,
      ),
    ).toBe(tokenEnd + 1);
  });

  it('highlights active segment when cursor is inside pill, not at trailing edge', () => {
    const segment = { start: 3, end: 11 };
    expect(isAtomicSegmentActive(segment, 3, 3, 3)).toBe(true);
    expect(isAtomicSegmentActive(segment, 10, 10, 10)).toBe(true);
    expect(isAtomicSegmentActive(segment, 11, 11, 11)).toBe(false);
    expect(isAtomicSegmentActive(segment, 12, 12, 12)).toBe(false);
    expect(isAtomicSegmentActive(segment, 5, 3, 11)).toBe(true);
  });

  it('skips field token on arrow left', () => {
    const text = 'IF({{单价}}>0,1)';
    const tokenStart = text.indexOf('{{单价}}');
    const tokenEnd = tokenStart + '{{单价}}'.length;
    expect(
      getAtomicArrowPos(text, tokenEnd, 'ArrowLeft', demoFields, demoMethods, SYNTAX_MUSTACHE),
    ).toBe(tokenStart);
    expect(
      getAtomicArrowPos(text, tokenEnd - 1, 'ArrowLeft', demoFields, demoMethods, SYNTAX_MUSTACHE),
    ).toBe(tokenStart);
  });

  it('snaps click position out of field token', () => {
    const text = 'IF({{单价}}>0,1)';
    const tokenStart = text.indexOf('{{单价}}');
    const tokenEnd = tokenStart + '{{单价}}'.length;
    expect(
      snapSelectionOutOfAtomicSegments(
        text,
        tokenStart + 3,
        tokenStart + 3,
        demoFields,
        demoMethods,
        SYNTAX_MUSTACHE,
      ),
    ).toEqual({ start: tokenStart, end: tokenStart });
    expect(
      snapSelectionOutOfAtomicSegments(
        text,
        tokenEnd - 1,
        tokenEnd - 1,
        demoFields,
        demoMethods,
        SYNTAX_MUSTACHE,
      ),
    ).toEqual({ start: tokenEnd, end: tokenEnd });
  });
});
