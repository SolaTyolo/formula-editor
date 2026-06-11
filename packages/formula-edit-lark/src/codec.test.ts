import { describe, expect, it } from 'vitest';
import { cnCodeToEn, enCodeToCn } from './core/codec';
import { SYNTAX_MUSTACHE } from './core/syntax';
import { demoFields, demoMethods } from './core/test-fixtures';
import type { TableRefItem } from './types';

const demoTableRefList: TableRefItem[] = [
  { id: 'main', name: '本表' },
  { id: 'stock', name: '库存表' },
];

describe('codec', () => {
  it('converts enCode to mustache cnCode', () => {
    const enCode = 'ROUND({{main.price}}*{{main.num}},2)';
    expect(enCodeToCn(enCode, demoFields, demoMethods, SYNTAX_MUSTACHE)).toBe(
      'ROUND({{单价}}*{{数量}},2)',
    );
  });

  it('converts legacy @ enCode to mustache cnCode', () => {
    const enCode = 'ROUND(@main.price*@main.num,2)';
    expect(enCodeToCn(enCode, demoFields, demoMethods, SYNTAX_MUSTACHE)).toBe(
      'ROUND({{单价}}*{{数量}},2)',
    );
  });

  it('roundtrips mustache field and function tokens', () => {
    const enCode = 'ROUND({{main.price}}*{{main.num}},2)';
    const cnCode = enCodeToCn(enCode, demoFields, demoMethods, SYNTAX_MUSTACHE);
    expect(cnCodeToEn(cnCode, demoFields, demoMethods, SYNTAX_MUSTACHE)).toBe(
      'ROUND({{main.price}}*{{main.num}},2)',
    );
  });

  it('converts cross-table field token in cnCode', () => {
    const enCode = '{{main.price}}+{{stock.stock}}';
    expect(enCodeToCn(enCode, demoFields, demoMethods, SYNTAX_MUSTACHE, demoTableRefList)).toBe(
      '{{单价}}+{{库存表.库存量}}',
    );
  });

  it('converts standalone table token in cnCode to {{tableId}}', () => {
    expect(
      cnCodeToEn('{{库存表}}', demoFields, demoMethods, SYNTAX_MUSTACHE, demoTableRefList),
    ).toBe('{{stock}}');
  });

  it('roundtrips standalone table token', () => {
    const cnCode = '{{单价}}+{{库存表}}';
    const enCode = cnCodeToEn(cnCode, demoFields, demoMethods, SYNTAX_MUSTACHE, demoTableRefList);
    expect(enCode).toBe('{{main.price}}+{{stock}}');
    expect(enCodeToCn(enCode, demoFields, demoMethods, SYNTAX_MUSTACHE, demoTableRefList)).toBe(
      cnCode,
    );
  });

  it('roundtrips legacy #func enCode to cnCode', () => {
    expect(
      enCodeToCn('#round({{main.price}}*{{main.num}},2)', demoFields, demoMethods, SYNTAX_MUSTACHE),
    ).toBe('ROUND({{单价}}*{{数量}},2)');
  });

  it('does not treat field token prefix as standalone table token in enCode', () => {
    const enCode = '{{stock.stock}}';
    expect(enCodeToCn(enCode, demoFields, demoMethods, SYNTAX_MUSTACHE, demoTableRefList)).toBe(
      '{{库存表.库存量}}',
    );
  });
});
