import {
  getFieldQueryPattern,
  getFunctionPrefixPattern,
  getFunctionQueryPattern,
  resolveSyntax,
  type SyntaxPresetName,
} from '../syntax';
import type { EditorSyntax } from '../../types';

export type TriggerContext = {
  type: 'field' | 'function';
  query: string;
  start: number;
  end: number;
  tablePrefix?: string;
  fieldQuery?: string;
};

export type TableBrowseContext = {
  query: string;
  start: number;
  end: number;
};

/** Plain-text table name filter before cursor (browse mode, no {{ trigger yet) */
export function findTableBrowseQuery(
  before: string,
  cursor: number,
  tableNames: string[],
): TableBrowseContext | null {
  if (tableNames.length === 0) return null;

  const match = before.match(/[\u4e00-\u9fffA-Za-z0-9_]+$/);
  if (!match) return null;

  const query = match[0];
  const start = cursor - query.length;

  const lastOpen = before.lastIndexOf('{{');
  const lastClose = before.lastIndexOf('}}');
  if (lastOpen !== -1 && lastOpen > lastClose && start >= lastOpen) return null;

  if (start > 0) {
    const prev = before[start - 1];
    if (!/[(\s,+\-*\/=<>!&|'"{}]/.test(prev)) return null;
  }

  const lower = query.toLowerCase();
  const matchesTable = tableNames.some((name) => {
    const value = name.toLowerCase();
    return value.startsWith(lower) || value.includes(lower);
  });
  if (!matchesTable) return null;

  return { query, start, end: cursor };
}

function parseTableQualifiedQuery(
  query: string,
  tableNames: string[],
): { tablePrefix?: string; fieldQuery: string } {
  const dotIndex = query.indexOf('.');
  if (dotIndex === -1) return { fieldQuery: query };

  const maybeTable = query.slice(0, dotIndex);
  const rest = query.slice(dotIndex + 1);
  const matched = tableNames.find(
    (name) => name === maybeTable || name.startsWith(maybeTable),
  );
  if (matched && query.length > matched.length && query[matched.length] === '.') {
    return { tablePrefix: matched, fieldQuery: query.slice(matched.length + 1) };
  }
  return { fieldQuery: query };
}

function findMustacheFieldTrigger(
  before: string,
  cursor: number,
  syntax: EditorSyntax,
  tableNames: string[],
): TriggerContext | null {
  const open = syntax.field.trigger;
  const close = syntax.field.close ?? '';
  const lastOpen = before.lastIndexOf(open);
  if (lastOpen === -1) return null;
  const afterOpen = before.slice(lastOpen + open.length, cursor);
  if (afterOpen.includes(close)) return null;
  if (!getFieldQueryPattern(syntax).test(afterOpen)) return null;
  const { tablePrefix, fieldQuery } = parseTableQualifiedQuery(afterOpen, tableNames);
  return {
    type: 'field',
    query: afterOpen,
    start: lastOpen,
    end: cursor,
    tablePrefix,
    fieldQuery,
  };
}

function findFieldTrigger(
  before: string,
  cursor: number,
  syntax: EditorSyntax,
  tableNames: string[],
): TriggerContext | null {
  if (syntax.field.close) {
    return findMustacheFieldTrigger(before, cursor, syntax, tableNames);
  }

  const trigger = syntax.field.trigger;
  for (let i = cursor - 1; i >= 0; i -= 1) {
    if (before.slice(i, i + trigger.length) !== trigger) continue;
    const query = before.slice(i + trigger.length, cursor);
    if (getFieldQueryPattern(syntax).test(query)) {
      const { tablePrefix, fieldQuery } = parseTableQualifiedQuery(query, tableNames);
      return { type: 'field', query, start: i, end: cursor, tablePrefix, fieldQuery };
    }
    break;
  }
  return null;
}

function findFunctionTrigger(
  before: string,
  cursor: number,
  syntax: EditorSyntax,
): TriggerContext | null {
  const funcTrigger = syntax.function.trigger;
  if (funcTrigger) {
    for (let i = cursor - 1; i >= 0; i -= 1) {
      if (before.slice(i, i + funcTrigger.length) !== funcTrigger) continue;
      const query = before.slice(i + funcTrigger.length, cursor);
      if (getFunctionQueryPattern().test(query)) {
        return { type: 'function', query, start: i, end: cursor };
      }
      break;
    }
  }

  if (!syntax.function.bareLetter) return null;

  const match = before.match(/[A-Za-z]+$/);
  if (!match) return null;

  const query = match[0];
  const start = before.length - query.length;
  if (start > 0) {
    const prev = before[start - 1];
    const blocked = /[A-Za-z0-9_@#.{}\]\u4e00-\u9fff]/.test(prev);
    if (blocked) return null;
    if (!getFunctionPrefixPattern(syntax).test(prev)) return null;
  }

  return { type: 'function', query, start, end: cursor };
}

export function getTriggerContext(
  text: string,
  cursor: number,
  syntaxInput?: EditorSyntax | SyntaxPresetName,
  tableNames: string[] = [],
): TriggerContext | null {
  const syntax = resolveSyntax(syntaxInput);
  const before = text.slice(0, cursor);
  return (
    findFieldTrigger(before, cursor, syntax, tableNames) ??
    findFunctionTrigger(before, cursor, syntax)
  );
}

export function filterHintItems<T extends { name: string; label?: string }>(
  items: T[],
  query: string,
): T[] {
  if (!query) return items;
  const lower = query.toLowerCase();
  return items
    .filter((item) => {
      const candidates = [item.name, item.label].filter(Boolean) as string[];
      return candidates.some((text) => {
        const value = text.toLowerCase();
        return value.startsWith(lower) || value.includes(lower);
      });
    })
    .sort((a, b) => {
      const aName = (a.label ?? a.name).toLowerCase();
      const bName = (b.label ?? b.name).toLowerCase();
      const aStarts = aName.startsWith(lower) ? 0 : 1;
      const bStarts = bName.startsWith(lower) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return aName.localeCompare(bName);
    });
}

export function getFunctionCursorOffset(text: string): number | null {
  const match = text.match(/^[.#]?[A-Za-z]+\(/);
  if (!match) return null;
  return match[0].length;
}
