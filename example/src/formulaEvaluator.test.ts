import { describe, expect, it } from 'vitest';
import {
  demoEvaluateContext,
  demoFields,
  demoMethods,
} from '../../packages/formula-edit-lark/src/core/test-fixtures';
import { evaluateFormula, isFormulaError } from './formulaEngine';
import { AVG_DIFF_FORMULA, evaluateFormulaWithTables } from './formulaEvaluator';

describe('formulaEngine', () => {
  it('evaluates numeric expressions', () => {
    expect(evaluateFormula('ROUND(80*3,2)')).toBe(240);
  });

  it('returns empty string for blank input', () => {
    expect(evaluateFormula('   ')).toBe('');
  });

  it('detects formula errors by prefix', () => {
    expect(isFormulaError('错误: division by zero', ['错误', 'Error'])).toBe(true);
    expect(isFormulaError(240, ['错误', 'Error'])).toBe(false);
  });
});

describe('formulaEvaluator', () => {
  it('evaluates editor formula for current row', () => {
    const result = evaluateFormulaWithTables(
      'ROUND({{main.price}}*{{main.num}},2)',
      demoFields,
      demoMethods,
      demoEvaluateContext,
      '错误',
    );
    expect(result).toBe(240);
  });

  it('evaluates column average diff formula', () => {
    const rows = demoEvaluateContext.tables[0].rows ?? [];
    const avg = rows.reduce((sum, row) => sum + Number(row.price), 0) / rows.length;

    for (const row of rows) {
      const ctx = {
        ...demoEvaluateContext,
        currentRowId: row.id,
        currentRow: row,
      };
      const result = evaluateFormulaWithTables(
        AVG_DIFF_FORMULA,
        demoFields,
        demoMethods,
        ctx,
        '错误',
      );
      expect(result).toBe(Math.round((Number(row.price) - avg) * 100) / 100);
    }
  });
});
