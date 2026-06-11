import { parseSegments } from '../segments';
import { resolveSyntax, type SyntaxPresetName } from '../syntax';
import {
  filterFieldsForHintPanel,
  filterTablesForHintPanel,
} from '../tables';
import type {
  EditorSyntax,
  FieldItem,
  HintListSection,
  LocaleMessages,
  MethodItem,
  TableRefItem,
} from '../../types';
import { filterHintItems, getTriggerContext, findTableBrowseQuery, type TriggerContext } from './utils';

export type HintPlacementMode = 'field' | 'function' | 'browse';

export type HintPlacement = {
  mode: HintPlacementMode;
  trigger: TriggerContext | null;
  fieldQuery: string;
  functionQuery: string;
  tableQuery: string;
  tablePrefix?: string;
  /** Replace range when filtering tables by plain text (e.g. typed 库存 → pick 库存表) */
  tableReplaceStart?: number;
  tableReplaceEnd?: number;
  /** Replace table token (and optional dot) when picking a field after table insert */
  fieldReplaceStart?: number;
  fieldReplaceEnd?: number;
};

function findSegmentAtEnd(
  segments: ReturnType<typeof parseSegments>,
  endPos: number,
) {
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const seg = segments[i];
    if (seg.type === 'text' && /^[.\s]+$/.test(seg.value) && seg.end === endPos) {
      continue;
    }
    if (seg.end <= endPos && endPos - seg.end <= 1) return seg;
  }
  return null;
}

export function getHintPlacement(
  text: string,
  cursor: number,
  fieldList: FieldItem[],
  methodList: MethodItem[],
  syntaxInput?: EditorSyntax | SyntaxPresetName,
  tableNames: string[] = [],
): HintPlacement {
  const syntax = resolveSyntax(syntaxInput);
  const before = text.slice(0, cursor);
  const endPos = before.trimEnd().length || cursor;
  const segments = parseSegments(before, fieldList, methodList, syntax, tableNames);
  const lastSeg = findSegmentAtEnd(segments, endPos);

  const trigger = getTriggerContext(text, cursor, syntax, tableNames);

  if (trigger?.type === 'function') {
    return {
      mode: 'function',
      trigger,
      fieldQuery: '',
      functionQuery: trigger.query,
      tableQuery: '',
    };
  }

  if (lastSeg?.type === 'field' && lastSeg.end === cursor) {
    return {
      mode: 'browse',
      trigger: null,
      fieldQuery: '',
      functionQuery: '',
      tableQuery: '',
    };
  }

  if (trigger?.type === 'field') {
    const tablePrefix = trigger.tablePrefix;
    return {
      mode: 'field',
      trigger,
      fieldQuery: trigger.fieldQuery ?? trigger.query,
      functionQuery: '',
      tableQuery: tablePrefix ? '' : trigger.query.split('.')[0],
      tablePrefix,
    };
  }

  if (lastSeg?.type === 'table') {
    const gap = before.slice(lastSeg.end, cursor);
    if (gap === '' || gap === '.') {
      return {
        mode: 'field',
        trigger: null,
        fieldQuery: '',
        functionQuery: '',
        tableQuery: '',
        tablePrefix: lastSeg.name,
        fieldReplaceStart: lastSeg.start,
        fieldReplaceEnd: cursor,
      };
    }
  }

  const tableBrowse = findTableBrowseQuery(before, cursor, tableNames);

  return {
    mode: 'browse',
    trigger: null,
    fieldQuery: '',
    functionQuery: '',
    tableQuery: tableBrowse?.query ?? '',
    ...(tableBrowse
      ? { tableReplaceStart: tableBrowse.start, tableReplaceEnd: tableBrowse.end }
      : {}),
  };
}

function buildFlatFunctionSection(
  methodList: MethodItem[],
  query: string,
  label: string,
): HintListSection[] {
  const items = filterHintItems(methodList, query) as MethodItem[];
  if (items.length === 0) return [];
  return [
    {
      key: 'functions',
      label,
      insertType: 'function',
      items,
    },
  ];
}

function buildFunctionSections(
  methodList: MethodItem[],
  query: string,
  defaultCategory: string,
  flatLabel?: string,
): HintListSection[] {
  if (flatLabel && !query) {
    return buildFlatFunctionSection(methodList, query, flatLabel);
  }

  const filtered = filterHintItems(methodList, query) as MethodItem[];
  if (filtered.length === 0) return [];

  const groups = new Map<string, MethodItem[]>();
  filtered.forEach((item) => {
    const groupLabel = item.category ?? defaultCategory;
    if (!groups.has(groupLabel)) groups.set(groupLabel, []);
    groups.get(groupLabel)!.push(item);
  });

  const sections: HintListSection[] = [];
  groups.forEach((items, groupLabel) => {
    sections.push({
      key: `func-${groupLabel}`,
      label: groupLabel,
      insertType: 'function',
      items,
    });
  });
  return sections;
}

export function buildHintSections(
  placement: HintPlacement,
  fieldList: FieldItem[],
  methodList: MethodItem[],
  tableRefList: TableRefItem[],
  hasTables: boolean,
  messages: LocaleMessages,
  currentTableId: string,
): HintListSection[] {
  const { mode, tablePrefix, fieldQuery, functionQuery, tableQuery } = placement;

  if (mode === 'function') {
    return buildFunctionSections(
      methodList,
      functionQuery,
      messages.fieldCategoryDefault,
      functionQuery ? undefined : messages.functionsTab,
    );
  }

  const sections: HintListSection[] = [];
  const scopedFields = filterFieldsForHintPanel(
    fieldList,
    tablePrefix,
    tableRefList,
    currentTableId,
  );
  const fields = filterHintItems(scopedFields, fieldQuery) as FieldItem[];

  if (fields.length > 0) {
    sections.push({
      key: 'fields',
      label: messages.fieldsSection,
      insertType: 'field',
      items: fields,
    });
  }

  if (mode === 'field' && tablePrefix) {
    sections.push(
      ...buildFlatFunctionSection(methodList, functionQuery, messages.functionsTab),
    );
    return sections;
  }

  if (hasTables && !tablePrefix && mode === 'browse') {
    const tables = filterTablesForHintPanel(tableRefList, currentTableId, tableQuery);
    if (tables.length > 0) {
      sections.push({
        key: 'tables',
        label: messages.tablesSection,
        insertType: 'table',
        items: tables,
      });
    }
  }

  if (mode === 'browse') {
    sections.push(
      ...buildFlatFunctionSection(methodList, functionQuery, messages.functionsTab),
    );
  }

  return sections;
}

export function resolveSectionInsertType(
  sections: HintListSection[],
  item: FieldItem | MethodItem | TableRefItem,
): 'field' | 'function' | 'table' {
  const section = sections.find((entry) => entry.items.some((row) => row === item));
  return section?.insertType ?? 'field';
}
