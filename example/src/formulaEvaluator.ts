import {
  parseEnFieldRef,
  resolveForEvaluation,
  type FieldItem,
  type EvaluateContext,
  type MethodItem,
} from 'formula-edit-lark';
import { evaluateFormula } from './formulaEngine';

/** Column-wide AVG / AVERAGE({{table.field}}) -> average across all rows */
function resolveColumnAggregates(enCode: string, ctx: EvaluateContext): string {
  return enCode.replace(
    /(?:AVERAGE|AVG)\((\{\{([\w.]+)\}\}|@([\w.]+))\)/gi,
    (_match, _fullRef: string, mustacheRef: string, legacyRef: string) => {
      const ref = mustacheRef ?? legacyRef;
      const parsed = parseEnFieldRef(ref, ctx.currentTableId);
      const table = ctx.tables.find((item) => item.id === parsed.tableId);
      if (!table?.rows?.length) return '0';

      const values = table.rows
        .map((row) => Number(row[parsed.fieldKey]))
        .filter((value) => Number.isFinite(value));
      if (values.length === 0) return '0';

      const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
      return String(avg);
    },
  );
}

/** 基于多表上下文求值（本行字段） */
export function evaluateFormulaWithTables(
  enCode: string,
  fieldList: FieldItem[],
  methodList: MethodItem[],
  ctx: EvaluateContext,
  errorPrefix: string,
): number | string {
  const withAggregates = resolveColumnAggregates(enCode, ctx);
  const executable = resolveForEvaluation(withAggregates, fieldList, methodList, ctx);
  const rowContext = ctx.currentRow ?? ctx.tables.find((t) => t.id === ctx.currentTableId)?.rows?.[0] ?? {};
  return evaluateFormula(executable, rowContext, errorPrefix);
}

/** 示例：单价与整列均价的差距 */
export const AVG_DIFF_FORMULA = '{{main.price}} - AVERAGE({{main.price}})';
