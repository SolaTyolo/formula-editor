import { tablesToFieldList, type FieldItem, type EvaluateContext, zhCN, enUS } from 'formula-edit-lark';
import type { AppLocale, AppMessages } from './i18n';
import { getTableSources, MAIN_TABLE_ID } from './tableSources';

export function buildDemoFieldList(messages: AppMessages, locale: AppLocale): FieldItem[] {
  const tables = getTableSources(messages);
  const fieldDescription =
    locale === 'en-US' ? enUS.defaultFieldDescription : zhCN.defaultFieldDescription;

  return tablesToFieldList(tables, {
    currentTableId: MAIN_TABLE_ID,
    fieldDescription,
  });
}

export function buildEvaluateContext(
  messages: AppMessages,
  currentRowId?: number,
): EvaluateContext {
  const tables = getTableSources(messages);
  const mainTable = tables.find((t) => t.id === MAIN_TABLE_ID);
  const currentRow =
    mainTable?.rows?.find((row) => row.id === currentRowId) ?? mainTable?.rows?.[0];

  return {
    tables,
    currentTableId: MAIN_TABLE_ID,
    currentRow,
    currentRowId,
  };
}

export { getTableSources, MAIN_TABLE_ID };
