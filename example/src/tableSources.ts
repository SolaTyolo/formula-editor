import type { TableSource } from 'formula-edit-lark';
import type { AppMessages } from './i18n';
import { getSampleRows, getTableColumns } from './i18n/messages';

const STOCK_ROWS = [
  { id: 1, stock: 100 },
  { id: 2, stock: 200 },
  { id: 3, stock: 150 },
];

/** 可注入的多张表（主表 + 关联表） */
export function getTableSources(messages: AppMessages): TableSource[] {
  return [
    {
      id: 'main',
      name: messages.tableMainName,
      columns: getTableColumns(messages),
      rows: getSampleRows(messages),
    },
    {
      id: 'stock',
      name: messages.tableStockName,
      columns: [{ title: messages.stockCol, field: 'stock', type: messages.typeNumber }],
      rows: STOCK_ROWS,
    },
  ];
}

export const MAIN_TABLE_ID = 'main';
