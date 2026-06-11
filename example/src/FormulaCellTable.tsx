import { useMemo, useRef, useState } from 'react';
import {
  CellHoverPreview,
  type AnchorRect,
  type FieldItem,
  type TableColumn,
  type TableSource,
} from 'formula-edit-lark';
import type { AppLocale, AppMessages } from './i18n';
import { isFormulaError } from './formulaEngine';
import { evaluateFormulaWithTables } from './formulaEvaluator';
import { getMethodList } from './methodList';
import { buildEvaluateContext } from './demoHelpers';
import { EDIT_THEME_CLASS } from './editorTheme';

export type FormulaColumnDef = {
  title: string;
  enCode: string;
};

type FormulaCellTableProps = {
  columns: TableColumn[];
  rows: Array<Record<string, number | string> & { id: number }>;
  formulaColumns: FormulaColumnDef[];
  locale: AppLocale;
  messages: AppMessages;
  fieldList: FieldItem[];
  tables?: TableSource[];
};

type PreviewState = {
  anchorRect: AnchorRect;
  enCode: string;
};

export function FormulaCellTable({
  columns,
  rows,
  formulaColumns,
  locale,
  messages,
  fieldList,
  tables,
}: FormulaCellTableProps) {
  const methodList = useMemo(() => getMethodList(locale), [locale]);
  const errorPrefixes = useMemo(() => ['错误', 'Error'], []);

  const [preview, setPreview] = useState<PreviewState | null>(null);
  const previewHoverRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const columnResults = useMemo(() => {
    return formulaColumns.map((col) =>
      rows.map((row) => {
        const ctx = buildEvaluateContext(messages, row.id);
        return evaluateFormulaWithTables(col.enCode, fieldList, methodList, ctx, messages.errorPrefix);
      }),
    );
  }, [formulaColumns, fieldList, methodList, rows, messages]);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHidePreview = () => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      if (!previewHoverRef.current) setPreview(null);
    }, 80);
  };

  const showPreview = (event: React.MouseEvent<HTMLTableCellElement>, enCode: string) => {
    clearHideTimer();
    const rect = event.currentTarget.getBoundingClientRect();
    setPreview({
      anchorRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
      enCode,
    });
  };

  return (
    <div className="formula-cell-table">
      <p className="hint">{messages.tableHint}</p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            {columns.map((col) => (
              <th key={col.field}>{col.title}</th>
            ))}
            {formulaColumns.map((col) => (
              <th key={col.title}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={String(row.id)}>
              <td>{row.id}</td>
              {columns.map((col) => (
                <td key={col.field}>{row[col.field]}</td>
              ))}
              {formulaColumns.map((col, colIndex) => {
                const result = columnResults[colIndex][rowIndex];
                return (
                  <td
                    key={col.title}
                    className={`formula-cell-table__formula-cell${
                      isFormulaError(result, errorPrefixes)
                        ? ' formula-cell-table__formula-cell--error'
                        : ''
                    }`}
                    onMouseEnter={(event) => showPreview(event, col.enCode)}
                    onMouseLeave={scheduleHidePreview}
                    title={messages.hoverToViewFormula}
                  >
                    {formatCellResult(result, errorPrefixes)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <CellHoverPreview
        open={Boolean(preview)}
        anchorRect={preview?.anchorRect ?? null}
        value={preview?.enCode ?? ''}
        fieldList={fieldList}
        methodList={methodList}
        tables={tables}
        syntax="mustache"
        classNames={{ popup: EDIT_THEME_CLASS }}
        onMouseEnter={() => {
          previewHoverRef.current = true;
          clearHideTimer();
        }}
        onMouseLeave={() => {
          previewHoverRef.current = false;
          setPreview(null);
        }}
      />
    </div>
  );
}

function formatCellResult(
  value: string | number,
  errorPrefixes: string[],
): string {
  if (value === '' || value === null || value === undefined) return '—';
  if (isFormulaError(value, errorPrefixes)) return String(value);
  return String(value);
}
