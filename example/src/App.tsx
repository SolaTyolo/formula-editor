import { useMemo, useRef, useState } from 'react';
import { EditLark, type EditLarkRef } from 'formula-edit-lark';
import { getMethodList } from './methodList';
import { FormulaCellTable } from './FormulaCellTable';
import { DataTablePanel } from './DataTablePanel';
import { buildDemoFieldList, getTableSources } from './demoHelpers';
import { MAIN_TABLE_ID } from './tableSources';
import { AVG_DIFF_FORMULA } from './formulaEvaluator';
import {
  formatAppMessage,
  getSampleRows,
  getTableColumns,
  useAppLocale,
} from './i18n';
import { editorWrapClass, PRESET_LABEL_KEYS, ThemeSwitcher } from './ThemeSwitcher';
import { THEME_PRESETS, type ThemePresetId } from './editorTheme';
import './editorTheme.css';
import './App.css';

const DEFAULT_ROW_FORMULA = 'ROUND({{main.price}}*{{main.num}},2)';

export default function App() {
  const editorRef = useRef<EditLarkRef>(null);
  const { locale, setLocale, messages } = useAppLocale();
  const [formula, setFormula] = useState(DEFAULT_ROW_FORMULA);
  const [confirmed, setConfirmed] = useState(DEFAULT_ROW_FORMULA);
  const [cnFormula, setCnFormula] = useState('');
  const [themeId, setThemeId] = useState<ThemePresetId>('indigo');

  const activePreset = useMemo(
    () => THEME_PRESETS.find((p) => p.id === themeId) ?? THEME_PRESETS[2],
    [themeId],
  );
  const themeLabels = PRESET_LABEL_KEYS[activePreset.id];

  const tableColumns = useMemo(() => getTableColumns(messages), [messages]);
  const sampleRows = useMemo(() => getSampleRows(messages), [messages]);
  const tableSources = useMemo(() => getTableSources(messages), [messages]);
  const methodList = useMemo(() => getMethodList(locale), [locale]);
  const fieldList = useMemo(() => buildDemoFieldList(messages, locale), [messages, locale]);

  const formulaColumns = useMemo(
    () => [
      { title: messages.formulaColumnTitle, enCode: confirmed },
      { title: messages.colAvgDiff, enCode: AVG_DIFF_FORMULA },
    ],
    [confirmed, messages.formulaColumnTitle, messages.colAvgDiff],
  );

  return (
    <div className="app">
      <header>
        <h1>{messages.title}</h1>
        <p>{messages.subtitle}</p>
      </header>

      <section className="controls">
        <label>
          {messages.language}
          <select value={locale} onChange={(e) => setLocale(e.target.value as 'zh-CN' | 'en-US')}>
            <option value="zh-CN">{messages.langZh}</option>
            <option value="en-US">{messages.langEn}</option>
          </select>
        </label>
      </section>

      <section className="layout">
        <div className="panel editor-panel">
          <div className="editor-panel__header">
            <div>
              <h2>{messages.editorPanel}</h2>
              <p className="hint">{messages.themeShowcaseHint}</p>
            </div>
            <ThemeSwitcher value={themeId} onChange={setThemeId} messages={messages} />
          </div>

          <p className="editor-panel__themeDesc">{messages[themeLabels.desc]}</p>

          <div className={editorWrapClass(themeId)}>
            <EditLark
              ref={editorRef}
              value={formula}
              fieldList={fieldList}
              methodList={methodList}
              tables={tableSources}
              currentTableId={MAIN_TABLE_ID}
              syntax="mustache"
              locale={locale}
              highlight
              theme={activePreset.theme}
              classNames={activePreset.classNames}
              onChange={(enCode, payload) => {
                setFormula(enCode);
                setCnFormula(payload.cnCode);
              }}
              onConfirm={(enCode, payload) => {
                setConfirmed(enCode);
                setCnFormula(payload.cnCode);
              }}
            />
          </div>

          <div className="formula-meta">
            <div>
              <span>{messages.cnCodeLabel}</span>
              <code>{cnFormula}</code>
            </div>
            <div>
              <span>{messages.enCodeLabel}</span>
              <code>{formula}</code>
            </div>
            <div>
              <span>{messages.confirmedLabel}</span>
              <code>{confirmed}</code>
            </div>
          </div>

          {activePreset.theme ? (
            <details className="editor-panel__tokens">
              <summary>{messages.themeTokensLabel}</summary>
              <pre>{JSON.stringify(activePreset.theme, null, 2)}</pre>
            </details>
          ) : (
            <p className="editor-panel__tokens editor-panel__tokens--empty">
              {messages.themeDefaultTokens}
            </p>
          )}

          <p className="hint">
            {formatAppMessage(messages.methodCountHint, { count: methodList.length })}
          </p>
        </div>

        <div className="panel">
          <h2>{messages.dataTablePanel}</h2>
          <DataTablePanel
            tables={tableSources}
            currentTableId={MAIN_TABLE_ID}
            messages={messages}
          />
        </div>
      </section>

      <section className="panel data-table-panel">
        <h2>{messages.tablePanel}</h2>
        <FormulaCellTable
          columns={tableColumns}
          rows={sampleRows}
          formulaColumns={formulaColumns}
          locale={locale}
          messages={messages}
          fieldList={fieldList}
          tables={tableSources}
        />
      </section>
    </div>
  );
}
