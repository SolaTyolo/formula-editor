import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { cnCodeToEn, enCodeToCn } from '../../core/codec';
import { getFieldTokenName } from '../../core/field-display';
import {
  buildHintSections,
  getHintPlacement,
  resolveSectionInsertType,
} from '../../core/hint/sections';
import {
  filterHintItems,
  getFunctionCursorOffset,
  getTriggerContext,
} from '../../core/hint/utils';
import {
  formatFieldToken,
  formatFunctionToken,
  formatTableRefToken,
  resolveSyntax,
  type SyntaxPresetName,
} from '../../core/syntax';
import { tablesToTableRefList } from '../../core/tables';
import { resolveLocale, type LocaleName } from '../../i18n';
import type {
  EditorSyntax,
  FieldItem,
  EditClassNames,
  EditTheme,
  HintListSection,
  LocaleMessages,
  MethodItem,
  TableRefItem,
  TableSource,
} from '../../types';
import type { FieldIconRenderer, TableIconRenderer } from '../icons/FieldTypeIcon';
import { cn } from '../cn';
import {
  confirmClasses,
  editorCellClasses,
  editorClasses,
  equalClasses,
  expandClasses,
  footerClasses,
  previewClasses,
  previewEqClasses,
  previewValueClasses,
  rootCellClasses,
  rootClasses,
  toolbarClasses,
} from '../classes';
import { CodeMirrorEditor, type CodeMirrorEditorHandle } from './CodeMirrorEditor';
import type { FormulaEditorInteraction } from './codemirror/interaction';
import { HintPanel } from '../hint/HintPanel';

export type EditLarkRef = {
  insertValue: (text: string) => void;
  getCnCode: () => string;
  getEnCode: () => string;
};

export type EditLarkProps = {
  value?: string;
  fieldList: FieldItem[];
  methodList: MethodItem[];
  tables?: TableSource[];
  currentTableId?: string;
  placeholder?: string;
  syntax?: EditorSyntax | SyntaxPresetName;
  locale?: LocaleName | Partial<LocaleMessages>;
  messages?: Partial<LocaleMessages>;
  theme?: EditTheme;
  className?: string;
  classNames?: EditClassNames;
  highlight?: boolean;
  renderFieldIcon?: FieldIconRenderer;
  renderTableIcon?: TableIconRenderer;
  mode?: 'default' | 'cell';
  previewResult?: string | number | null;
  showExpand?: boolean;
  onExpandClick?: () => void;
  onChange?: (enCode: string, payload: { cnCode: string; enCode: string }) => void;
  onConfirm?: (enCode: string, payload: { cnCode: string; enCode: string }) => void;
};

export const EditLark = forwardRef<EditLarkRef, EditLarkProps>(
  function EditLark(
    {
      value = '',
      fieldList,
      methodList,
      tables = [],
      currentTableId = 'main',
      placeholder,
      syntax: syntaxInput,
      locale,
      messages,
      theme,
      className,
      classNames,
      highlight = true,
      renderFieldIcon,
      renderTableIcon,
      mode = 'default',
      previewResult,
      showExpand = false,
      onExpandClick,
      onChange,
      onConfirm,
    },
    ref,
  ) {
    const syntax = useMemo(() => resolveSyntax(syntaxInput), [syntaxInput]);
    const i18n = useMemo(() => resolveLocale(locale, messages), [locale, messages]);
    const tableRefList = useMemo(
      () => tablesToTableRefList(tables, i18n.defaultTableDescription),
      [tables, i18n.defaultTableDescription],
    );
    const tableNames = useMemo(() => tableRefList.map((t) => t.name), [tableRefList]);
    const hasTables = tableRefList.length > 0;
    const editorRef = useRef<CodeMirrorEditorHandle>(null);
    const interactionRef = useRef<FormulaEditorInteraction>({});
    const [cnCode, setCnCode] = useState(() =>
      enCodeToCn(value, fieldList, methodList, syntax, tableRefList),
    );
    const [cursor, setCursor] = useState(0);
    const [hintActiveIndex, setHintActiveIndex] = useState(0);

    useEffect(() => {
      setCnCode(enCodeToCn(value, fieldList, methodList, syntax, tableRefList));
    }, [value, fieldList, methodList, syntax, tableRefList]);

    const hintPlacement = useMemo(
      () => getHintPlacement(cnCode, cursor, fieldList, methodList, syntax, tableNames),
      [cnCode, cursor, fieldList, methodList, syntax, tableNames],
    );

    const triggerContext = hintPlacement.trigger;

    useEffect(() => {
      setHintActiveIndex(0);
    }, [hintPlacement.mode, hintPlacement.tablePrefix, triggerContext?.query, cursor]);

    const hintSections = useMemo(
      (): HintListSection[] =>
        buildHintSections(
          hintPlacement,
          fieldList,
          methodList,
          tableRefList,
          hasTables,
          i18n,
          currentTableId,
        ),
      [hintPlacement, fieldList, methodList, tableRefList, hasTables, i18n, currentTableId],
    );

    const emitChange = useCallback(
      (nextCnCode: string) => {
        const enCode = cnCodeToEn(nextCnCode, fieldList, methodList, syntax, tableRefList);
        onChange?.(enCode, { cnCode: nextCnCode, enCode });
      },
      [fieldList, methodList, onChange, syntax],
    );

    const getSelection = useCallback(() => {
      return editorRef.current?.getSelection() ?? { from: cursor, to: cursor };
    }, [cursor]);

    const replaceRange = useCallback(
      (start: number, end: number, text: string, cursorInText?: number) => {
        const pos = start + (cursorInText ?? text.length);
        editorRef.current?.replaceRange(start, end, text, pos);
        setCursor(pos);
      },
      [],
    );

    const insertAtCursor = useCallback(
      (
        text: string,
        replaceFrom?: number,
        replaceTo?: number,
        cursorInText?: number,
      ) => {
        if (replaceFrom !== undefined && replaceTo !== undefined) {
          replaceRange(replaceFrom, replaceTo, text, cursorInText);
          return;
        }

        const { from, to } = getSelection();
        replaceRange(from, to, text, cursorInText);
      },
      [getSelection, replaceRange],
    );

    useImperativeHandle(ref, () => ({
      insertValue: (text: string) => {
        const cursorInText = getFunctionCursorOffset(text) ?? undefined;
        insertAtCursor(text, undefined, undefined, cursorInText);
      },
      getCnCode: () => cnCode,
      getEnCode: () => cnCodeToEn(cnCode, fieldList, methodList, syntax, tableRefList),
    }));

    const resolveTriggerContext = useCallback(
      (insertType: 'field' | 'function' | 'table') => {
        const { from } = getSelection();
        const ctx = getTriggerContext(cnCode, from, syntax, tableNames);
        if (ctx?.type === insertType) return ctx;
        if (insertType === 'table' && triggerContext?.type === 'field') return triggerContext;
        return triggerContext?.type === insertType ? triggerContext : null;
      },
      [cnCode, getSelection, syntax, tableNames, triggerContext],
    );

    const handleInsert = useCallback(
      (item: FieldItem | MethodItem | TableRefItem, insertType: 'field' | 'function' | 'table') => {
        const ctx = resolveTriggerContext(insertType);

        if (insertType === 'table') {
          const table = item as TableRefItem;
          const text = formatTableRefToken(table.name, syntax);
          if (ctx) {
            insertAtCursor(text, ctx.start, ctx.end);
          } else if (
            hintPlacement.tableReplaceStart !== undefined &&
            hintPlacement.tableReplaceEnd !== undefined
          ) {
            insertAtCursor(text, hintPlacement.tableReplaceStart, hintPlacement.tableReplaceEnd);
          } else {
            insertAtCursor(text);
          }
          return;
        }

        if (insertType === 'field') {
          const field = item as FieldItem;
          const text = formatFieldToken(getFieldTokenName(field), syntax);
          if (ctx) {
            insertAtCursor(text, ctx.start, ctx.end);
          } else if (
            hintPlacement.fieldReplaceStart !== undefined &&
            hintPlacement.fieldReplaceEnd !== undefined
          ) {
            insertAtCursor(text, hintPlacement.fieldReplaceStart, hintPlacement.fieldReplaceEnd);
          } else {
            insertAtCursor(text);
          }
          setHintActiveIndex(0);
          return;
        }

        const text = formatFunctionToken((item as MethodItem).value, syntax);
        const cursorInText = getFunctionCursorOffset(text) ?? undefined;
        if (ctx) {
          insertAtCursor(text, ctx.start, ctx.end, cursorInText);
        } else {
          insertAtCursor(text, undefined, undefined, cursorInText);
        }
      },
      [insertAtCursor, resolveTriggerContext, syntax, hintPlacement.tableReplaceStart, hintPlacement.tableReplaceEnd, hintPlacement.fieldReplaceStart, hintPlacement.fieldReplaceEnd, setHintActiveIndex],
    );

    const getHintSelectableItems = useCallback(() => {
      const rows: Array<FieldItem | MethodItem | TableRefItem> = [];
      hintSections.forEach((section) => {
        const query =
          section.insertType === 'table'
            ? hintPlacement.tableQuery
            : section.insertType === 'function'
              ? hintPlacement.functionQuery
              : hintPlacement.fieldQuery;
        rows.push(
          ...(filterHintItems(
            section.items as Array<{ name: string; label?: string }>,
            query,
          ) as Array<FieldItem | MethodItem | TableRefItem>),
        );
      });
      return rows;
    }, [hintPlacement.fieldQuery, hintPlacement.functionQuery, hintPlacement.tableQuery, hintSections]);

    const handleHintKeyDown = useCallback(
      (key: string) => {
        const items = getHintSelectableItems();
        if (items.length === 0) return false;

        if (triggerContext) {
          if (key === 'ArrowDown') {
            setHintActiveIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
            return true;
          }
          if (key === 'ArrowUp') {
            setHintActiveIndex((i) => Math.max(i - 1, 0));
            return true;
          }
          if ((key === 'Tab' || key === 'Enter') && items[hintActiveIndex]) {
            const item = items[hintActiveIndex];
            handleInsert(item, resolveSectionInsertType(hintSections, item));
            return true;
          }
          return false;
        }

        if (
          hintPlacement.mode === 'function' ||
          hintPlacement.mode === 'browse' ||
          hintPlacement.mode === 'field'
        ) {
          if (key === 'ArrowDown') {
            setHintActiveIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
            return true;
          }
          if (key === 'ArrowUp') {
            setHintActiveIndex((i) => Math.max(i - 1, 0));
            return true;
          }
          if (key === 'Tab' && items[hintActiveIndex]) {
            handleInsert(items[hintActiveIndex], resolveSectionInsertType(hintSections, items[hintActiveIndex]));
            return true;
          }
        }

        return false;
      },
      [
        getHintSelectableItems,
        handleInsert,
        hintActiveIndex,
        hintPlacement.mode,
        hintSections,
        triggerContext,
      ],
    );

    interactionRef.current = {
      onHintKeyDown: (_view, key) => handleHintKeyDown(key),
    };

    const handleConfirm = () => {
      const enCode = cnCodeToEn(cnCode, fieldList, methodList, syntax, tableRefList);
      onConfirm?.(enCode, { cnCode, enCode });
    };

    const rootStyle = theme as CSSProperties | undefined;
    const isCellMode = mode === 'cell';
    const previewText =
      previewResult === null || previewResult === undefined || previewResult === ''
        ? i18n.previewEmpty
        : String(previewResult);

    return (
      <div
        className={cn(rootClasses, isCellMode && rootCellClasses, className, classNames?.root)}
        style={rootStyle}
      >
        <div className={cn(editorClasses, isCellMode && editorCellClasses, classNames?.editor)}>
          <CodeMirrorEditor
            ref={editorRef}
            value={cnCode}
            placeholder={placeholder ?? i18n.placeholder}
            fieldList={fieldList}
            methodList={methodList}
            tableRefList={tableRefList}
            tableNames={tableNames}
            syntax={syntax}
            classNames={classNames}
            compact={isCellMode}
            highlight={highlight}
            interactionRef={interactionRef}
            onChange={(next, pos) => {
              setCnCode(next);
              setCursor(pos);
              emitChange(next);
            }}
          />
        </div>

        {isCellMode ? (
          <>
            <div className={cn(previewClasses, classNames?.preview)}>
              <span className={cn(previewEqClasses, classNames?.equal)}>=</span>
              <span className={previewValueClasses}>{previewText}</span>
              {showExpand ? (
                <button
                  type="button"
                  className={cn(expandClasses, classNames?.expand)}
                  aria-label={i18n.expandEditor}
                  title={i18n.expandEditor}
                  onClick={onExpandClick}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                    <path
                      d="M9 1h4v4M5 13H1V9M13 5L8.5 9.5M1 9l4.5-4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : null}
            </div>

            <HintPanel
              title={i18n.editFormulaTab}
              sections={hintSections}
              onInsert={handleInsert}
              fieldFilterQuery={hintPlacement.fieldQuery}
              tableFilterQuery={hintPlacement.tableQuery}
              functionFilterQuery={hintPlacement.functionQuery}
              activeIndex={hintActiveIndex}
              onActiveIndexChange={setHintActiveIndex}
              triggerActive={Boolean(triggerContext)}
              triggerType={triggerContext?.type ?? null}
              syntax={syntax}
              messages={i18n}
              currentTableId={currentTableId}
              classNames={classNames}
              renderFieldIcon={renderFieldIcon}
              renderTableIcon={renderTableIcon}
            />

            <div className={cn(footerClasses, classNames?.footer)}>
              <button
                type="button"
                className={cn(confirmClasses, classNames?.confirm)}
                onClick={handleConfirm}
              >
                {i18n.confirm}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={cn(toolbarClasses, classNames?.toolbar)}>
              <span className={cn(equalClasses, classNames?.equal)}>=</span>
              <button
                type="button"
                className={cn(confirmClasses, classNames?.confirm)}
                onClick={handleConfirm}
              >
                {i18n.confirm}
              </button>
            </div>

            <HintPanel
              title={i18n.editFormulaTab}
              sections={hintSections}
              onInsert={handleInsert}
              fieldFilterQuery={hintPlacement.fieldQuery}
              tableFilterQuery={hintPlacement.tableQuery}
              functionFilterQuery={hintPlacement.functionQuery}
              activeIndex={hintActiveIndex}
              onActiveIndexChange={setHintActiveIndex}
              triggerActive={Boolean(triggerContext)}
              triggerType={triggerContext?.type ?? null}
              syntax={syntax}
              messages={i18n}
              currentTableId={currentTableId}
              classNames={classNames}
              renderFieldIcon={renderFieldIcon}
              renderTableIcon={renderTableIcon}
            />
          </>
        )}
      </div>
    );
  },
);
