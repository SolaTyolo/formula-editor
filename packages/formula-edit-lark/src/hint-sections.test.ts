import { describe, expect, it } from 'vitest';
import { buildHintSections, getHintPlacement } from './core/hint/sections';
import { filterHintItems } from './core/hint/utils';
import { SYNTAX_MUSTACHE } from './core/syntax';
import { zhCN } from './i18n';
import { demoFields, demoMethods } from './core/test-fixtures';
import type { FieldItem } from './types';

const tableNames = ['本表', '库存表'];

const demoTableRefList = [
  { id: 'main', name: '本表' },
  { id: 'stock', name: '库存表' },
];

describe('hintSections', () => {
  it('keeps browse mode after a completed field token at cursor end', () => {
    const text = '{{月份}}';
    const fields = [
      ...demoFields,
      {
        name: '月份',
        tokenName: '月份',
        label: '月份',
        value: 'main.month',
        tableId: 'main',
        columnTitle: '月份',
        isCurrentTable: true,
        type: '公式',
      },
    ];
    const cursor = text.length;

    const placement = getHintPlacement(text, cursor, fields, demoMethods, SYNTAX_MUSTACHE, tableNames);
    expect(placement.mode).toBe('browse');

    const sections = buildHintSections(
      placement,
      fields,
      demoMethods,
      demoTableRefList,
      true,
      zhCN,
      'main',
    );
    expect(sections.some((section) => section.insertType === 'field')).toBe(true);
    expect(sections.some((section) => section.insertType === 'function')).toBe(true);
  });

  it('shows fields, tables and functions when editor is empty', () => {
    const placement = getHintPlacement('', 0, demoFields, demoMethods, SYNTAX_MUSTACHE, tableNames);
    expect(placement.mode).toBe('browse');

    const sections = buildHintSections(
      placement,
      demoFields,
      demoMethods,
      demoTableRefList,
      true,
      zhCN,
      'main',
    );
    expect(sections.some((section) => section.insertType === 'field')).toBe(true);
    expect(sections.some((section) => section.insertType === 'table')).toBe(true);
    expect(sections.some((section) => section.insertType === 'function')).toBe(true);
  });

  it('includes current table first in tables section when browsing', () => {
    const placement = getHintPlacement('', 0, demoFields, demoMethods, SYNTAX_MUSTACHE, tableNames);
    const sections = buildHintSections(
      placement,
      demoFields,
      demoMethods,
      demoTableRefList,
      true,
      zhCN,
      'main',
    );
    const tableSection = sections.find((section) => section.insertType === 'table');
    expect(tableSection?.items.map((item) => item.name)).toEqual(['本表', '库存表']);
  });

  it('shows fields scoped to selected table after table token', () => {
    const text = '{{库存表}}.';
    const placement = getHintPlacement(
      text,
      text.length,
      demoFields,
      demoMethods,
      SYNTAX_MUSTACHE,
      tableNames,
    );
    expect(placement.mode).toBe('field');
    expect(placement.tablePrefix).toBe('库存表');

    const sections = buildHintSections(
      placement,
      demoFields,
      demoMethods,
      demoTableRefList,
      true,
      zhCN,
      'main',
    );
    expect(sections.some((section) => section.insertType === 'field')).toBe(true);
    expect(sections.some((section) => section.insertType === 'function')).toBe(true);
    expect(sections.some((section) => section.insertType === 'table')).toBe(false);
  });

  it('shows browse fields, tables and functions when cursor is at start of existing formula', () => {
    const text = 'ROUND({{单价}}*{{数量}},2)';
    const placement = getHintPlacement(text, 0, demoFields, demoMethods, SYNTAX_MUSTACHE, tableNames);
    expect(placement.mode).toBe('browse');

    const sections = buildHintSections(
      placement,
      demoFields,
      demoMethods,
      demoTableRefList,
      true,
      zhCN,
      'main',
    );
    expect(sections.some((section) => section.insertType === 'field')).toBe(true);
    expect(sections.some((section) => section.insertType === 'table')).toBe(true);
    expect(sections.some((section) => section.insertType === 'function')).toBe(true);
  });

  it('keeps field at index 1 after completed field token so tab does not pick AND', () => {
    const methods: typeof demoMethods = [
      { name: 'IF', value: 'IF(,,)', realValue: 'if', category: '逻辑' },
      { name: 'AND', value: 'AND(,)', realValue: 'and', category: '逻辑' },
      ...demoMethods,
    ];
    const fields: FieldItem[] = [
      { name: '备注', tokenName: '备注', value: 'main.text', tableId: 'main', isCurrentTable: true },
      { name: '交易日期', tokenName: '交易日期', value: 'main.date', tableId: 'main', isCurrentTable: true },
    ];
    const text = '{{备注}}';
    const placement = getHintPlacement(text, text.length, fields, methods, SYNTAX_MUSTACHE, tableNames);
    const sections = buildHintSections(
      placement,
      fields,
      methods,
      demoTableRefList,
      true,
      zhCN,
      'main',
    );
    const flat = sections.flatMap((section) => {
      const query =
        section.insertType === 'function'
          ? placement.functionQuery
          : placement.fieldQuery;
      return filterHintItems(section.items as Array<{ name: string }>, query);
    });
    expect(flat[1]?.name).toBe('交易日期');
  });

  it('scopes fields and sets replace range after table token insert', () => {
    const text = 'IF(1,2,{{库存表}}';
    const cursor = text.length;
    const placement = getHintPlacement(
      text,
      cursor,
      demoFields,
      demoMethods,
      SYNTAX_MUSTACHE,
      tableNames,
    );
    expect(placement.mode).toBe('field');
    expect(placement.tablePrefix).toBe('库存表');
    expect(placement.fieldReplaceStart).toBe(text.indexOf('{{库存表}}'));
    expect(placement.fieldReplaceEnd).toBe(cursor);

    const sections = buildHintSections(
      placement,
      demoFields,
      demoMethods,
      demoTableRefList,
      true,
      zhCN,
      'main',
    );
    const fieldSection = sections.find((section) => section.insertType === 'field');
    expect(fieldSection?.items.map((item) => item.name)).toEqual(['库存表.库存量']);
  });

  it('detects plain-text table filter query in browse mode', () => {
    const text = "IF({{交易日期}} > '2023-01-01',库存";
    const cursor = text.length;
    const placement = getHintPlacement(
      text,
      cursor,
      demoFields,
      demoMethods,
      SYNTAX_MUSTACHE,
      tableNames,
    );
    expect(placement.mode).toBe('browse');
    expect(placement.tableQuery).toBe('库存');
    expect(placement.tableReplaceStart).toBe(text.indexOf('库存'));
    expect(placement.tableReplaceEnd).toBe(cursor);
  });
});
