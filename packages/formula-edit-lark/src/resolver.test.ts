import { describe, expect, it } from 'vitest';
import { resolveForEvaluation } from './core/resolver';
import { demoFields, demoMethods, demoEvaluateContext } from './core/test-fixtures';

describe('resolver', () => {
  it('resolves current-row field refs to scalars', () => {
    const expr = resolveForEvaluation(
      'ROUND({{main.price}}*{{main.num}},2)',
      demoFields,
      demoMethods,
      demoEvaluateContext,
    );
    expect(expr).toBe('ROUND(80*3,2)');
  });

  it('resolves legacy @ field refs', () => {
    const expr = resolveForEvaluation(
      'ROUND(@main.price*@main.num,2)',
      demoFields,
      demoMethods,
      demoEvaluateContext,
    );
    expect(expr).toBe('ROUND(80*3,2)');
  });

  it('resolves cross-table field refs', () => {
    const expr = resolveForEvaluation(
      '{{main.price}}+{{stock.stock}}',
      demoFields,
      demoMethods,
      demoEvaluateContext,
    );
    expect(expr).toBe('80+100');
  });
});
