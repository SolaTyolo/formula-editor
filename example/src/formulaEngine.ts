import * as formulajs from '@formulajs/formulajs';

(globalThis as unknown as { formulajs: typeof formulajs }).formulajs = formulajs;
import '@jspreadsheet/formula/dist/index.js';

type FormulaFn = (expression: string, context: Record<string, unknown>) => unknown;
const formula = (globalThis as unknown as { formula: FormulaFn }).formula;

export function evaluateFormula(
  expression: string,
  context: Record<string, number | string>,
): number | string {
  const trimmed = expression.trim();
  if (!trimmed) return '';

  try {
    const result = formula(trimmed, context);
    const num = Number(result);
    if (Number.isFinite(num)) return Math.round(num * 100) / 100;
    return String(result ?? '');
  } catch (e) {
    return `错误: ${e instanceof Error ? e.message : String(e)}`;
  }
}
