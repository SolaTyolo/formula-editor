import { describe, expect, it } from 'vitest';
import { splitEditorPillDisplay } from './pill-display';
import { SYNTAX_MUSTACHE } from '../../core/syntax';

describe('splitEditorPillDisplay', () => {
  it('hides {{ }} wrappers for mustache syntax', () => {
    expect(splitEditorPillDisplay('{{交易日期}}', SYNTAX_MUSTACHE, 'field')).toEqual({
      prefix: '{{',
      label: '交易日期',
      suffix: '}}',
    });
  });

  it('keeps table name inside wrappers', () => {
    expect(splitEditorPillDisplay('{{库存表}}', SYNTAX_MUSTACHE, 'table')).toEqual({
      prefix: '{{',
      label: '库存表',
      suffix: '}}',
    });
  });
});
