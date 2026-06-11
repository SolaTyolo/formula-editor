import { describe, expect, it } from 'vitest';
import { parseSegments } from './core/segments';
import { SYNTAX_MUSTACHE } from './core/syntax';
import { demoFields, demoMethods } from './core/test-fixtures';

describe('segments', () => {
  it('parses field and function segments for mustache syntax', () => {
    const segments = parseSegments(
      'ROUND({{单价}}*{{数量}},2)',
      demoFields,
      demoMethods,
      SYNTAX_MUSTACHE,
      ['库存表'],
    );

    expect(segments.map((segment) => segment.type)).toEqual([
      'function',
      'text',
      'field',
      'text',
      'field',
      'text',
    ]);
    expect(segments.find((segment) => segment.type === 'field')?.name).toBe('单价');
  });

  it('parses cross-table field token', () => {
    const segments = parseSegments(
      'IF({{库存表.库存量}}>0,0,1)',
      demoFields,
      demoMethods,
      SYNTAX_MUSTACHE,
      ['库存表'],
    );

    expect(
      segments.some(
        (segment) => segment.type === 'field' && segment.name === '库存表.库存量',
      ),
    ).toBe(true);
  });

  it('parses table token', () => {
    const segments = parseSegments(
      '{{库存表}}',
      demoFields,
      demoMethods,
      SYNTAX_MUSTACHE,
      ['库存表'],
    );

    expect(segments.some((segment) => segment.type === 'table' && segment.name === '库存表')).toBe(
      true,
    );
  });
});
