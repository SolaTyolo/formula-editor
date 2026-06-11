import { buildFieldTokenRegExp, buildTableTokenRegExp } from './syntax';
import type { EditorSyntax, FieldItem, ExpressionSegment, MethodItem } from '../types';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type MatchCandidate = ExpressionSegment & { start: number };

/** Split display text into plain text / field pill / function tokens */
export function parseSegments(
  text: string,
  fieldList: FieldItem[],
  methodList: MethodItem[],
  syntax: EditorSyntax,
  tableNames: string[] = [],
): ExpressionSegment[] {
  if (!text) return [];

  const candidates: MatchCandidate[] = [];

  const fieldReg = buildFieldTokenRegExp(fieldList, syntax);
  if (fieldReg) {
    fieldReg.lastIndex = 0;
    let m = fieldReg.exec(text);
    while (m) {
      candidates.push({
        type: 'field',
        value: m[0],
        name: m[1],
        start: m.index,
        end: m.index + m[0].length,
      });
      m = fieldReg.exec(text);
    }
  }

  const tableReg = buildTableTokenRegExp(tableNames, syntax);
  if (tableReg) {
    tableReg.lastIndex = 0;
    let m = tableReg.exec(text);
    while (m) {
      const start = m.index;
      const end = start + m[0].length;
      if (!candidates.some((c) => c.start <= start && c.end >= end)) {
        candidates.push({
          type: 'table',
          value: m[0],
          name: m[1],
          start,
          end,
        });
      }
      m = tableReg.exec(text);
    }
  }

  const funcNames = methodList
    .map((item) => escapeRegExp(item.name))
    .sort((a, b) => b.length - a.length);
  if (funcNames.length > 0) {
    const funcAlt = funcNames.join('|');
    const prefix = syntax.function.trigger ? escapeRegExp(syntax.function.trigger) : '';
    const funcReg = new RegExp(`${prefix}(${funcAlt})(?=\\()`, 'gi');
    let m = funcReg.exec(text);
    while (m) {
      const start = m.index;
      const end = start + m[0].length;
      candidates.push({
        type: 'function',
        value: m[0],
        name: m[1].toUpperCase(),
        start,
        end,
      });
      m = funcReg.exec(text);
    }

    if (syntax.function.bareLetter && !syntax.function.trigger) {
      const bareReg = new RegExp(`\\b(${funcAlt})(?=\\()`, 'gi');
      let bm = bareReg.exec(text);
      while (bm) {
        const start = bm.index;
        const end = start + bm[0].length;
        if (!candidates.some((c) => c.start <= start && c.end >= end)) {
          candidates.push({
            type: 'function',
            value: bm[0],
            name: bm[1].toUpperCase(),
            start,
            end,
          });
        }
        bm = bareReg.exec(text);
      }
    }
  }

  candidates.sort((a, b) => a.start - b.start || b.end - a.end - (a.end - a.start));

  const picked: MatchCandidate[] = [];
  let lastEnd = 0;
  for (const c of candidates) {
    if (c.start < lastEnd) continue;
    picked.push(c);
    lastEnd = c.end;
  }

  const segments: ExpressionSegment[] = [];
  let cursor = 0;
  for (const c of picked) {
    if (c.start > cursor) {
      segments.push({
        type: 'text',
        value: text.slice(cursor, c.start),
        start: cursor,
        end: c.start,
      });
    }
    segments.push(c);
    cursor = c.end;
  }
  if (cursor < text.length) {
    segments.push({ type: 'text', value: text.slice(cursor), start: cursor, end: text.length });
  }

  return segments;
}
