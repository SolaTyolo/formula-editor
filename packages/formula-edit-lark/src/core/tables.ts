import type { FieldItem, SampleRow, TableColumn, TableRefItem, TableSource } from '../types';

export type TablesToFieldListOptions = {
  currentTableId: string;
  fieldDescription?: string;
  tableDescription?: string;
  larkStyle?: boolean;
};

function buildTokenName(
  table: TableSource,
  column: TableColumn,
  isCurrent: boolean,
  larkStyle: boolean,
  multiTable: boolean,
): string {
  const colLabel = column.title;
  if (larkStyle) {
    if (isCurrent) return colLabel;
    return `${table.name}.${colLabel}`;
  }
  if (!multiTable && isCurrent) return colLabel;
  return `${table.name}.${colLabel}`;
}

export function tablesToTableRefList(
  tables: TableSource[],
  tableDescription?: string,
): TableRefItem[] {
  return tables.map((table) => ({
    id: table.id,
    name: table.name,
    description: tableDescription,
  }));
}

export function tablesToFieldList(
  tables: TableSource[],
  options: TablesToFieldListOptions,
): FieldItem[] {
  const { currentTableId, fieldDescription, larkStyle = true } = options;
  const multiTable = tables.length > 1;
  const items: FieldItem[] = [];

  for (const table of tables) {
    const isCurrent = table.id === currentTableId;
    for (const column of table.columns) {
      const value = `${table.id}.${column.field}`;
      const tokenBase = buildTokenName(table, column, isCurrent, larkStyle, multiTable);

      items.push({
        name: tokenBase,
        tokenName: tokenBase,
        label: column.title,
        value,
        tableId: table.id,
        tableName: isCurrent && larkStyle ? undefined : table.name,
        columnTitle: column.title,
        isCurrentTable: isCurrent,
        type: column.type,
        iconType: column.iconType,
        tag: column.type,
        description: fieldDescription,
      });
    }
  }

  return items;
}

export function getTableRows(table: TableSource): SampleRow[] {
  return table.rows ?? [];
}

export function filterFieldsByTablePrefix(
  fields: FieldItem[],
  tablePrefix: string | undefined,
  tableRefList: TableRefItem[],
): FieldItem[] {
  if (!tablePrefix) return fields;
  const table = tableRefList.find((item) => item.name === tablePrefix);
  if (!table) return fields;
  return fields.filter((field) => field.tableId === table.id);
}

export function filterFieldsForHintPanel(
  fields: FieldItem[],
  tablePrefix: string | undefined,
  tableRefList: TableRefItem[],
  currentTableId: string,
): FieldItem[] {
  if (tablePrefix) {
    return filterFieldsByTablePrefix(fields, tablePrefix, tableRefList);
  }
  return fields.filter((field) => field.tableId === currentTableId);
}

export function filterTablesForHintPanel(
  tables: TableRefItem[],
  currentTableId: string,
  query: string,
): TableRefItem[] {
  const sorted = [...tables].sort((a, b) => {
    if (a.id === currentTableId) return -1;
    if (b.id === currentTableId) return 1;
    return a.name.localeCompare(b.name, 'zh-CN');
  });
  return filterTablesByQuery(sorted, query);
}

export function filterTablesByQuery(
  tables: TableRefItem[],
  query: string,
): TableRefItem[] {
  if (!query) return tables;
  const lower = query.toLowerCase();
  return tables.filter((table) => {
    const name = table.name.toLowerCase();
    return name.startsWith(lower) || name.includes(lower);
  });
}
