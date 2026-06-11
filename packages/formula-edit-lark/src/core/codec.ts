import {
  buildFieldTokenRegExp,
  buildTableTokenRegExp,
  formatFieldToken,
  formatTableRefToken,
  resolveSyntax,
  type SyntaxPresetName,
} from './syntax';
import { getFieldTokenName } from './field-display';
import {
  buildEnFieldToken,
  buildEnTableToken,
  buildLegacyEnFieldToken,
  buildLegacyEnTableToken,
  findFieldByName,
  sortFieldsForReplace,
} from './field-ref';
import type { EditorSyntax, FieldItem, MethodItem, TableRefItem } from '../types';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceFieldTokens(
  cnCode: string,
  fieldList: FieldItem[],
  syntax: EditorSyntax,
): string {
  const reg = buildFieldTokenRegExp(fieldList, syntax);
  if (!reg) return cnCode;
  return cnCode.replace(reg, (match, name: string) => {
    const field = findFieldByName(fieldList, name);
    return field ? buildEnFieldToken(field) : match;
  });
}

function replaceTableTokens(
  cnCode: string,
  tableRefList: TableRefItem[],
  syntax: EditorSyntax,
): string {
  const tableNames = tableRefList.map((table) => table.name);
  const reg = buildTableTokenRegExp(tableNames, syntax);
  if (!reg) return cnCode;
  return cnCode.replace(reg, (match, name: string) => {
    const table = tableRefList.find((item) => item.name === name);
    return table ? buildEnTableToken(table) : match;
  });
}

function replaceEnTableTokens(
  enCode: string,
  tableRefList: TableRefItem[],
  syntax: EditorSyntax,
): string {
  let cnCode = enCode;
  const sorted = [...tableRefList].sort((a, b) => b.id.length - a.id.length);
  for (const table of sorted) {
    cnCode = cnCode.replaceAll(
      buildEnTableToken(table),
      formatTableRefToken(table.name, syntax),
    );
    const legacy = buildLegacyEnTableToken(table);
    cnCode = cnCode.replace(
      new RegExp(`${escapeRegExp(legacy)}(?!\\.)`, 'g'),
      formatTableRefToken(table.name, syntax),
    );
  }
  return cnCode;
}

/** Display cnCode -> storage enCode ({{table.field}} / {{table}}; functions keep bare names) */
export function cnCodeToEn(
  cnCode: string,
  fieldList: FieldItem[],
  methodList: MethodItem[],
  syntaxInput?: EditorSyntax | SyntaxPresetName,
  tableRefList: TableRefItem[] = [],
): string {
  const syntax = resolveSyntax(syntaxInput);
  let enCode = replaceFieldTokens(cnCode, fieldList, syntax);
  enCode = replaceTableTokens(enCode, tableRefList, syntax);

  methodList.forEach((item) => {
    const trigger = syntax.function.trigger
      ? syntax.function.trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      : '';
    if (!trigger) return;

    enCode = enCode.replace(
      new RegExp(`${trigger}${item.name}(?=\\()`, 'gi'),
      `#${item.realValue}`,
    );
    enCode = enCode.replaceAll(`#${item.name}`, `#${item.realValue}`);
  });

  return enCode;
}

/** Storage enCode -> display cnCode */
export function enCodeToCn(
  enCode: string,
  fieldList: FieldItem[],
  methodList: MethodItem[],
  syntaxInput?: EditorSyntax | SyntaxPresetName,
  tableRefList: TableRefItem[] = [],
): string {
  const syntax = resolveSyntax(syntaxInput);
  let cnCode = enCode;

  for (const item of sortFieldsForReplace(fieldList)) {
    const display = formatFieldToken(getFieldTokenName(item), syntax);
    cnCode = cnCode.replaceAll(buildEnFieldToken(item), display);
    cnCode = cnCode.replaceAll(buildLegacyEnFieldToken(item), display);
  }

  methodList.forEach((item) => {
    const displayName = item.name;
    const trigger = syntax.function.trigger;
    if (trigger) {
      cnCode = cnCode.replace(
        new RegExp(`#${item.realValue}(?=\\()`, 'gi'),
        `${trigger}${displayName}`,
      );
    }
    cnCode = cnCode.replace(new RegExp(`#${item.realValue}(?=\\()`, 'gi'), displayName);
    cnCode = cnCode.replaceAll(
      `#${item.realValue}`,
      trigger ? `${trigger}${displayName}` : displayName,
    );
  });

  cnCode = replaceEnTableTokens(cnCode, tableRefList, syntax);

  return cnCode;
}

/** @deprecated Single-table row formulas only; use resolveForEvaluation for multi-table */
export function toExecutableExpression(
  enCode: string,
  fieldList: FieldItem[],
  methodList: MethodItem[],
): string {
  let expr = enCode;

  for (const item of sortFieldsForReplace(fieldList)) {
    expr = expr.replaceAll(buildEnFieldToken(item), item.value);
  }

  methodList.forEach((item) => {
    expr = expr.replaceAll(`#${item.realValue}`, item.realValue.toUpperCase());
    expr = expr.replace(new RegExp(`\\b${item.name}(?=\\()`, 'gi'), item.realValue.toUpperCase());
  });

  return expr;
}

export function columnsToFieldList(
  columns: Array<{ title: string; field: string; type: string }>,
  fieldDescription?: string,
  tableId = 'main',
): FieldItem[] {
  return columns.map((col) => ({
    name: col.title,
    tokenName: col.title,
    label: col.title,
    value: `${tableId}.${col.field}`,
    tableId,
    columnTitle: col.title,
    isCurrentTable: true,
    type: col.type,
    tag: col.type,
    description: fieldDescription,
  }));
}
