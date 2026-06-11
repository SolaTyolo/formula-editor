import type { FieldItem, MethodItem } from './types';

const FIELD_REG = /@[^\s+\-*\/#%(),;!<>=@]*/g;

export function columnsToFieldList(
  columns: Array<{ title: string; field: string; type: string }>,
): FieldItem[] {
  return columns.map((col) => ({
    name: col.title,
    value: col.field,
    type: col.type,
    tag: col.type,
    description: '数据表的一列，返回当前行中该列对应的值，可用于公式计算',
  }));
}

/** 展示态（中文 @字段名） -> 存储态（英文 @fieldKey） */
export function cnCodeToEn(
  cnCode: string,
  fieldList: FieldItem[],
  methodList: MethodItem[],
): string {
  let enCode = cnCode.replace(FIELD_REG, (match) => {
    const field = fieldList.find((item) => `@${item.name}` === match);
    return field ? `@${field.value}` : match;
  });

  methodList.forEach((item) => {
    enCode = enCode.replaceAll(`#${item.name}`, `#${item.realValue}`);
    enCode = enCode.replace(new RegExp(`\\b${item.name}(?=\\()`, 'g'), `#${item.realValue}`);
  });

  return enCode;
}

/** 存储态 -> 展示态 */
export function enCodeToCn(
  enCode: string,
  fieldList: FieldItem[],
  methodList: MethodItem[],
): string {
  let cnCode = enCode;

  fieldList.forEach((item) => {
    cnCode = cnCode.replaceAll(`@${item.value}`, `@${item.name}`);
  });

  methodList.forEach((item) => {
    cnCode = cnCode.replace(new RegExp(`#${item.realValue}(?=\\()`, 'gi'), item.name);
    cnCode = cnCode.replaceAll(`#${item.realValue}`, `#${item.name}`);
  });

  return cnCode;
}

/** 转成可执行的表达式：@price -> price，#sum -> SUM */
export function toExecutableExpression(
  enCode: string,
  fieldList: FieldItem[],
  methodList: MethodItem[],
): string {
  let expr = enCode;

  fieldList.forEach((item) => {
    expr = expr.replaceAll(`@${item.value}`, item.value);
  });

  methodList.forEach((item) => {
    expr = expr.replaceAll(`#${item.realValue}`, item.realValue.toUpperCase());
    expr = expr.replace(new RegExp(`\\b${item.name}(?=\\()`, 'gi'), item.realValue.toUpperCase());
  });

  return expr;
}
