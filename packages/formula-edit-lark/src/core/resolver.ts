import {
  buildEnFieldToken,
  buildLegacyEnFieldToken,
  buildLegacyEnTableToken,
  parseEnFieldRef,
  parseFieldValue,
  sortFieldsForReplace,
} from './field-ref';
import type { FieldItem, EvaluateContext, MethodItem } from '../types';

function formatScalar(value: unknown): string {
  if (value === null || value === undefined || value === '') return '0';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '0';
  if (typeof value === 'string') {
    const num = Number(value);
    if (Number.isFinite(num) && value.trim() !== '') return String(num);
    return JSON.stringify(value);
  }
  return JSON.stringify(value);
}

function resolveRowValue(
  tableId: string,
  fieldKey: string,
  ctx: EvaluateContext,
): unknown {
  const table = ctx.tables.find((item) => item.id === tableId);
  if (!table?.rows?.length) return 0;

  let row: typeof ctx.currentRow;
  if (ctx.currentRowId !== undefined) {
    row = table.rows.find((item) => String(item.id ?? item) === String(ctx.currentRowId));
  }
  if (!row && ctx.currentTableId === tableId) {
    row = ctx.currentRow;
  }
  row = row ?? table.rows[0];
  return row?.[fieldKey] ?? 0;
}

function replaceFunctions(expr: string, methodList: MethodItem[]): string {
  let next = expr;
  methodList.forEach((item) => {
    next = next.replaceAll(`#${item.realValue}`, item.realValue.toUpperCase());
    next = next.replace(new RegExp(`\\b${item.name}(?=\\()`, 'gi'), item.realValue.toUpperCase());
  });
  return next;
}

function replaceKnownFields(
  expr: string,
  fieldList: FieldItem[],
  ctx: EvaluateContext,
): string {
  let next = expr;
  for (const field of sortFieldsForReplace(fieldList)) {
    const token = buildEnFieldToken(field);
    const { tableId, fieldKey } = parseFieldValue(field.value, ctx.currentTableId);
    const replacement = formatScalar(resolveRowValue(tableId, fieldKey, ctx));
    next = next.split(token).join(replacement);
  }
  return next;
}

function replaceRemainingFieldTokens(expr: string, ctx: EvaluateContext): string {
  const replaceRef = (ref: string) => {
    const parsed = parseEnFieldRef(ref, ctx.currentTableId);
    return formatScalar(resolveRowValue(parsed.tableId, parsed.fieldKey, ctx));
  };

  expr = expr.replace(/\{\{([\w.]+)\}\}/g, (_, ref: string) => replaceRef(ref));
  expr = expr.replace(/@([\w.]+)/g, (_, ref: string) => replaceRef(ref));
  return expr;
}

/** Resolve enCode to an expression executable by a formula engine (row fields -> scalars) */
export function resolveForEvaluation(
  enCode: string,
  fieldList: FieldItem[],
  methodList: MethodItem[],
  ctx: EvaluateContext,
): string {
  let expr = replaceKnownFields(enCode, fieldList, ctx);
  expr = replaceRemainingFieldTokens(expr, ctx);
  expr = replaceFunctions(expr, methodList);
  return expr;
}
