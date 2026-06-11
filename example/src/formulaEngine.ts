import * as formulajs from '@formulajs/formulajs';

export function evaluateFormula(
  expression: string,
  context: Record<string, number | string>,
  errorPrefix = '错误',
): number | string {
  const trimmed = expression.trim();
  if (!trimmed) return '';

  try {
    const scope: Record<string, unknown> = { ...formulajs, ...context };
    const keys = Object.keys(scope);
    const values = keys.map((key) => scope[key]);
    const run = new Function(...keys, `"use strict"; return (${trimmed})`) as (
      ...args: unknown[]
    ) => unknown;
    const result = run(...values);
    const num = Number(result);
    if (Number.isFinite(num)) return Math.round(num * 100) / 100;
    return String(result ?? '');
  } catch (e) {
    return `${errorPrefix}: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export function isFormulaError(value: string | number, errorPrefixes: string[]): boolean {
  if (typeof value !== 'string') return false;
  return errorPrefixes.some((prefix) => value.startsWith(`${prefix}:`));
}
