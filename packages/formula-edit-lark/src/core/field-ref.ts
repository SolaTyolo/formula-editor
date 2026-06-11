import type { FieldItem, TableRefItem } from '../types';
import { getFieldTokenName } from './field-display';

/** Storage field token, e.g. {{main.price}} */
export function buildEnFieldToken(field: FieldItem): string {
  return `{{${field.value}}}`;
}

/** Legacy @-prefixed storage field token */
export function buildLegacyEnFieldToken(field: FieldItem): string {
  return `@${field.value}`;
}

/** Storage table token, e.g. {{stock}} */
export function buildEnTableToken(table: TableRefItem): string {
  return `{{${table.id}}}`;
}

/** Legacy @-prefixed storage table token */
export function buildLegacyEnTableToken(table: TableRefItem): string {
  return `@${table.id}`;
}

export function parseFieldValue(
  value: string,
  defaultTableId?: string,
): { tableId: string; fieldKey: string } {
  if (value.includes('.')) {
    const [tableId, fieldKey] = value.split('.', 2);
    return { tableId, fieldKey };
  }
  return { tableId: defaultTableId ?? 'main', fieldKey: value };
}

export type ParsedEnFieldRef = {
  tableId: string;
  fieldKey: string;
  raw: string;
};

/** Parse @table.field (and legacy @field) from enCode */
export function parseEnFieldRef(ref: string, defaultTableId?: string): ParsedEnFieldRef {
  const { tableId, fieldKey } = parseFieldValue(ref, defaultTableId);
  return { tableId, fieldKey, raw: ref };
}

export function sortFieldsForReplace(fields: FieldItem[]): FieldItem[] {
  return [...fields].sort((a, b) => buildEnFieldToken(b).length - buildEnFieldToken(a).length);
}

export function findFieldByName(fieldList: FieldItem[], name: string): FieldItem | undefined {
  return fieldList.find((item) => getFieldTokenName(item) === name || item.name === name);
}

export function findFieldByToken(fieldList: FieldItem[], token: string): FieldItem | undefined {
  return fieldList.find((item) => buildEnFieldToken(item) === token);
}
