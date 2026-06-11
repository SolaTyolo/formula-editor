import type { FieldItem } from '../types';

/** cnCode match name (without syntax trigger) */
export function getFieldTokenName(field: FieldItem): string {
  return field.tokenName ?? field.name;
}

/** Hint list display label */
export function getFieldLabel(field: FieldItem): string {
  return field.label ?? field.columnTitle ?? field.name;
}

/** Whether pill renders table.column as two inline parts */
export function shouldShowTableInPill(field: FieldItem): boolean {
  return Boolean(field.tableName && field.isCurrentTable === false);
}
