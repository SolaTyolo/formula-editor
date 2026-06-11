import type { LocaleMessages } from '../types';

export const zhCN: LocaleMessages = {
  placeholder: '请输入公式',
  confirm: '确认',
  editFormulaTab: '编辑公式',
  fieldsTab: '字段引用',
  fieldsSection: '字段',
  tablesSection: '数据表',
  currentTableBadge: '当前',
  functionsTab: '函数',
  syntax: '语法',
  description: '说明',
  example: '示例',
  detailTitle: '说明',
  tabHint: 'Tab',
  noMatch: '无匹配项',
  noMatchQuery: '未找到匹配「{query}」的{type}',
  matchCount: '输入「{query}」匹配 {count} 项，↑↓ 选择，Tab 补全',
  fieldType: '字段',
  functionType: '函数',
  defaultFieldHint: '输入 {trigger} 引用字段，直接输入字母引用函数；↑↓ 选择，Tab 插入',
  defaultFieldDescription: '数据表的一列，返回当前行中该列对应的值，可用于公式计算',
  defaultTableDescription: '点击插入表名，继续选择该表下的字段',
  fieldInTableDescription: '数据表 {table} 中的字段，可用于公式计算',
  functionFallback: '函数 {name}，点击或按 Tab 插入到公式中',
  fieldCategoryDefault: '函数',
  expandEditor: '展开编辑器',
  previewEmpty: '—',
};

export const enUS: LocaleMessages = {
  placeholder: 'Enter formula',
  confirm: 'Confirm',
  editFormulaTab: 'Edit Formula',
  fieldsTab: 'Fields',
  fieldsSection: 'Fields',
  tablesSection: 'Tables',
  currentTableBadge: 'Current',
  functionsTab: 'Functions',
  syntax: 'Syntax',
  description: 'Description',
  example: 'Example',
  detailTitle: 'Details',
  tabHint: 'Tab',
  noMatch: 'No matches',
  noMatchQuery: 'No {type} matching "{query}"',
  matchCount: 'Typed "{query}" — {count} match(es). ↑↓ to select, Tab to insert',
  fieldType: 'field',
  functionType: 'function',
  defaultFieldHint: 'Type {trigger} for fields, letters for functions. ↑↓ select, Tab insert',
  defaultFieldDescription: 'A table column value for the current row',
  defaultTableDescription: 'Insert table name, then pick a field from that table',
  fieldInTableDescription: 'A field in table {table}, usable in formulas',
  functionFallback: 'Function {name}. Click or Tab to insert',
  fieldCategoryDefault: 'Functions',
  expandEditor: 'Expand',
  previewEmpty: '—',
};

export const LOCALES = {
  'zh-CN': zhCN,
  'en-US': enUS,
} as const;

export type LocaleName = keyof typeof LOCALES;

export function resolveLocale(
  locale?: LocaleName | Partial<LocaleMessages>,
  overrides?: Partial<LocaleMessages>,
): LocaleMessages {
  const base =
    typeof locale === 'string'
      ? LOCALES[locale] ?? zhCN
      : { ...zhCN, ...(locale ?? {}) };
  return { ...base, ...overrides };
}

export function formatMessage(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}
