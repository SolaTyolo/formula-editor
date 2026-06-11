import type { TableSource } from 'formula-edit-lark';
import type { AppMessages } from './i18n';

type DataTablePanelProps = {
  tables: TableSource[];
  currentTableId: string;
  messages: AppMessages;
};

function SourceTable({ table }: { table: TableSource }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          {table.columns.map((col) => (
            <th key={col.field}>{col.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows?.map((row) => (
          <tr key={String(row.id)}>
            <td>{row.id}</td>
            {table.columns.map((col) => (
              <td key={col.field}>{row[col.field]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DataTablePanel({ tables, currentTableId, messages }: DataTablePanelProps) {
  const currentTable = tables.find((table) => table.id === currentTableId);
  const linkedTables = tables.filter((table) => table.id !== currentTableId);

  return (
    <div className="table-source-panel">
      <div className="table-source-list">
        <h3 className="sub-table-title">{messages.tablesListTitle}</h3>
        <ul className="table-source-list__items">
          {tables.map((table) => (
            <li
              key={table.id}
              className={`table-source-list__item${
                table.id === currentTableId ? ' table-source-list__item--current' : ''
              }`}
            >
              <span className="table-source-list__name">{table.name}</span>
              {table.id === currentTableId ? (
                <span className="table-source-list__badge">{messages.currentTableBadge}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      {currentTable ? (
        <section className="table-source-section">
          <h3 className="sub-table-title">{messages.currentTablePanel}</h3>
          <SourceTable table={currentTable} />
        </section>
      ) : null}

      {linkedTables.length > 0 ? (
        <section className="table-source-section">
          <h3 className="sub-table-title">{messages.linkedTablePanel}</h3>
          {linkedTables.map((table) => (
            <div key={table.id} className="linked-table-block">
              <h4 className="linked-table-block__title">{table.name}</h4>
              <SourceTable table={table} />
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
