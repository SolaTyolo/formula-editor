import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cnCodeToEn, enCodeToCn } from '../formulaCodec';
import { getTriggerContext, filterHintItems, getFunctionCursorOffset } from '../hintUtils';
import type { FieldItem, HintCategory, MethodItem } from '../types';
import { HintPanel } from './HintPanel';
import './FormulaEditLark.css';

export type FormulaEditLarkRef = {
  insertValue: (text: string) => void;
  getCnCode: () => string;
  getEnCode: () => string;
};

export type FormulaEditLarkProps = {
  value?: string;
  fieldList: FieldItem[];
  methodList: MethodItem[];
  placeholder?: string;
  onChange?: (enCode: string, payload: { cnCode: string; enCode: string }) => void;
  onConfirm?: (enCode: string, payload: { cnCode: string; enCode: string }) => void;
};

export const FormulaEditLark = forwardRef<FormulaEditLarkRef, FormulaEditLarkProps>(function FormulaEditLark(
  {
    value = '',
    fieldList,
    methodList,
    placeholder = '请输入公式',
    onChange,
    onConfirm,
  },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cnCode, setCnCode] = useState(() => enCodeToCn(value, fieldList, methodList));
  const [activeCategoryKey, setActiveCategoryKey] = useState('fields');
  const [cursor, setCursor] = useState(0);
  const [hintActiveIndex, setHintActiveIndex] = useState(0);

  useEffect(() => {
    setCnCode(enCodeToCn(value, fieldList, methodList));
  }, [value, fieldList, methodList]);

  const syncCursor = useCallback(() => {
    const el = textareaRef.current;
    if (el) setCursor(el.selectionStart);
  }, []);

  const triggerContext = useMemo(
    () => getTriggerContext(cnCode, cursor),
    [cnCode, cursor],
  );

  useEffect(() => {
    if (!triggerContext) return;
    setActiveCategoryKey(triggerContext.type === 'field' ? 'fields' : 'functions');
    setHintActiveIndex(0);
  }, [triggerContext]);

  const categories = useMemo<HintCategory[]>(
    () => [
      {
        key: 'fields',
        label: '字段引用',
        insertType: 'field',
        items: fieldList,
      },
      {
        key: 'functions',
        label: '逻辑函数',
        insertType: 'function',
        items: methodList,
      },
    ],
    [fieldList, methodList],
  );

  const emitChange = (nextCnCode: string) => {
    const enCode = cnCodeToEn(nextCnCode, fieldList, methodList);
    onChange?.(enCode, { cnCode: nextCnCode, enCode });
  };

  const replaceRange = (start: number, end: number, text: string, cursorInText?: number) => {
    const el = textareaRef.current;
    const next = cnCode.slice(0, start) + text + cnCode.slice(end);
    setCnCode(next);
    emitChange(next);

    const pos = start + (cursorInText ?? text.length);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(pos, pos);
      setCursor(pos);
    });
  };

  const insertAtCursor = (
    text: string,
    replaceFrom?: number,
    replaceTo?: number,
    cursorInText?: number,
  ) => {
    const el = textareaRef.current;
    if (replaceFrom !== undefined && replaceTo !== undefined) {
      replaceRange(replaceFrom, replaceTo, text, cursorInText);
      return;
    }

    if (!el) {
      const next = cnCode + text;
      setCnCode(next);
      emitChange(next);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = cnCode.slice(0, start) + text + cnCode.slice(end);
    setCnCode(next);
    emitChange(next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + (cursorInText ?? text.length);
      el.setSelectionRange(pos, pos);
      setCursor(pos);
    });
  };

  useImperativeHandle(ref, () => ({
    insertValue: (text: string) => {
      const cursorInText = getFunctionCursorOffset(text) ?? undefined;
      insertAtCursor(text, undefined, undefined, cursorInText);
    },
    getCnCode: () => cnCode,
    getEnCode: () => cnCodeToEn(cnCode, fieldList, methodList),
  }));

  const resolveTriggerContext = (insertType: 'field' | 'function') => {
    const ctx = getTriggerContext(cnCode, textareaRef.current?.selectionStart ?? cursor);
    if (ctx?.type === insertType) return ctx;
    return triggerContext?.type === insertType ? triggerContext : null;
  };

  const handleInsert = (item: FieldItem | MethodItem, insertType: 'field' | 'function') => {
    const ctx = resolveTriggerContext(insertType);

    if (insertType === 'field') {
      const text = `@${(item as FieldItem).name}`;
      if (ctx) {
        insertAtCursor(text, ctx.start, ctx.end);
      } else {
        insertAtCursor(text);
      }
      return;
    }

    const text = (item as MethodItem).value;
    const cursorInText = getFunctionCursorOffset(text) ?? undefined;
    if (ctx) {
      insertAtCursor(text, ctx.start, ctx.end, cursorInText);
    } else {
      insertAtCursor(text, undefined, undefined, cursorInText);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!triggerContext) return;

    const category = categories.find((c) => c.insertType === triggerContext.type);
    const items = filterHintItems(category?.items ?? [], triggerContext.query);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHintActiveIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHintActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if ((e.key === 'Tab' || e.key === 'Enter') && items[hintActiveIndex]) {
      e.preventDefault();
      handleInsert(items[hintActiveIndex], triggerContext.type);
    }
  };

  const handleConfirm = () => {
    const enCode = cnCodeToEn(cnCode, fieldList, methodList);
    onConfirm?.(enCode, { cnCode, enCode });
  };

  return (
    <div className="formula-edit-lark">
      <div className="formula-edit-lark__editor">
        <textarea
          ref={textareaRef}
          className="formula-edit-lark__textarea"
          value={cnCode}
          placeholder={placeholder}
          onChange={(e) => {
            setCnCode(e.target.value);
            setCursor(e.target.selectionStart);
            emitChange(e.target.value);
          }}
          onSelect={syncCursor}
          onKeyUp={syncCursor}
          onClick={syncCursor}
          onKeyDown={handleTextareaKeyDown}
        />
      </div>

      <div className="formula-edit-lark__toolbar">
        <span className="formula-edit-lark__equal">=</span>
        <button type="button" className="formula-edit-lark__confirm" onClick={handleConfirm}>
          确认
        </button>
      </div>

      <HintPanel
        categories={categories}
        activeCategoryKey={activeCategoryKey}
        onCategoryChange={setActiveCategoryKey}
        onInsert={handleInsert}
        filterQuery={triggerContext?.query ?? ''}
        activeIndex={hintActiveIndex}
        onActiveIndexChange={setHintActiveIndex}
        triggerActive={Boolean(triggerContext)}
        triggerType={triggerContext?.type ?? null}
      />
    </div>
  );
});
