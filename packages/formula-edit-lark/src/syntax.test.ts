import { describe, expect, it } from 'vitest';
import {
  buildTableTokenRegExp,
  formatFieldToken,
  formatTableRefToken,
  SYNTAX_MUSTACHE,
} from './core/syntax';

describe('syntax', () => {
  it('formats field token as {{name}}', () => {
    expect(formatFieldToken('单价', SYNTAX_MUSTACHE)).toBe('{{单价}}');
  });

  it('formats table ref token as {{tableName}}', () => {
    expect(formatTableRefToken('库存表', SYNTAX_MUSTACHE)).toBe('{{库存表}}');
  });

  it('matches table token before dot suffix', () => {
    const reg = buildTableTokenRegExp(['库存表'], SYNTAX_MUSTACHE);
    expect(reg!.exec('{{库存表}}.x')?.[1]).toBe('库存表');
    expect(reg!.exec('{{库存表.库存量}}')).toBeNull();
  });
});
