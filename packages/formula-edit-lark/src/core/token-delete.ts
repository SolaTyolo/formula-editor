import { parseSegments } from './segments';
import { resolveSyntax, type SyntaxPresetName } from './syntax';
import type { EditorSyntax, FieldItem, MethodItem } from '../types';

export type TextRange = { start: number; end: number };

function getAtomicSegments(
  text: string,
  fieldList: FieldItem[],
  methodList: MethodItem[],
  syntax: EditorSyntax,
  tableNames: string[],
) {
  return parseSegments(text, fieldList, methodList, syntax, tableNames).filter(
    (segment) => segment.type === 'field' || segment.type === 'table',
  );
}

/** Whether cursor/selection is focused on a field/table pill (not when caret is past the right edge) */
export function isAtomicSegmentActive(
  segment: TextRange,
  pos: number,
  selFrom: number,
  selTo: number,
): boolean {
  if (selFrom !== selTo) {
    return segment.end > selFrom && segment.start < selTo;
  }
  return pos >= segment.start && pos < segment.end;
}

/** Arrow key target: skip over field/table tokens as a whole */
export function getAtomicArrowPos(
  text: string,
  pos: number,
  direction: 'ArrowLeft' | 'ArrowRight',
  fieldList: FieldItem[],
  methodList: MethodItem[],
  syntaxInput?: EditorSyntax | SyntaxPresetName,
  tableNames: string[] = [],
): number | null {
  const syntax = resolveSyntax(syntaxInput);
  const segments = getAtomicSegments(text, fieldList, methodList, syntax, tableNames);
  if (segments.length === 0) return null;

  if (direction === 'ArrowRight') {
    for (const segment of segments) {
      if (pos > segment.start && pos <= segment.end) {
        if (pos === segment.end) {
          return pos < text.length ? pos + 1 : pos;
        }
        return segment.end;
      }
    }
    const newPos = pos + 1;
    if (newPos >= text.length) return null;
    for (const segment of segments) {
      if (newPos >= segment.start && newPos < segment.end) {
        return segment.end;
      }
    }
    return null;
  }

  for (const segment of segments) {
    if (pos >= segment.start && pos < segment.end) {
      if (pos === segment.start) {
        return pos > 0 ? pos - 1 : pos;
      }
      return segment.start;
    }
  }
  const newPos = pos - 1;
  if (newPos < 0) return null;
  for (const segment of segments) {
    if (newPos > segment.start && newPos <= segment.end) {
      return segment.start;
    }
  }
  return null;
}

/** Arrow key target when a range is selected */
export function getAtomicArrowPosWithSelection(
  text: string,
  selFrom: number,
  selTo: number,
  direction: 'ArrowLeft' | 'ArrowRight',
  fieldList: FieldItem[],
  methodList: MethodItem[],
  syntaxInput?: EditorSyntax | SyntaxPresetName,
  tableNames: string[] = [],
): number | null {
  if (selFrom === selTo) return null;

  const syntax = resolveSyntax(syntaxInput);
  const segments = getAtomicSegments(text, fieldList, methodList, syntax, tableNames);

  if (direction === 'ArrowRight') {
    let target = selTo;
    for (const segment of segments) {
      if (segment.end <= selFrom || segment.start >= selTo) continue;
      target = Math.max(target, segment.end);
    }
    for (const segment of segments) {
      if (selFrom === segment.start && selTo === segment.end) {
        return target < text.length ? target + 1 : target;
      }
    }
    return target;
  }

  let target = selFrom;
  for (const segment of segments) {
    if (segment.end <= selFrom || segment.start >= selTo) continue;
    target = Math.min(target, segment.start);
  }
  for (const segment of segments) {
    if (selFrom === segment.start && selTo === segment.end) {
      return target > 0 ? target - 1 : target;
    }
  }
  return target;
}

/** Snap caret out of the middle of a field/table token (e.g. after click) */
export function snapSelectionOutOfAtomicSegments(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  fieldList: FieldItem[],
  methodList: MethodItem[],
  syntaxInput?: EditorSyntax | SyntaxPresetName,
  tableNames: string[] = [],
): TextRange | null {
  if (selectionStart !== selectionEnd) return null;

  const syntax = resolveSyntax(syntaxInput);
  const segments = getAtomicSegments(text, fieldList, methodList, syntax, tableNames);
  const pos = selectionStart;

  for (const segment of segments) {
    if (pos > segment.start && pos < segment.end) {
      const snap =
        pos - segment.start <= segment.end - pos ? segment.start : segment.end;
      return { start: snap, end: snap };
    }
  }

  return null;
}

/** Delete field/table pills atomically; plain text deletes character-by-character */
export function getAtomicDeleteRange(
  text: string,
  cursorStart: number,
  cursorEnd: number,
  key: 'Backspace' | 'Delete',
  fieldList: FieldItem[],
  methodList: MethodItem[],
  syntaxInput?: EditorSyntax | SyntaxPresetName,
  tableNames: string[] = [],
): TextRange | null {
  const syntax = resolveSyntax(syntaxInput);
  const atomicSegments = getAtomicSegments(text, fieldList, methodList, syntax, tableNames);
  if (atomicSegments.length === 0) return null;

  if (cursorStart !== cursorEnd) {
    let start = cursorStart;
    let end = cursorEnd;
    let expanded = false;
    for (const segment of atomicSegments) {
      if (segment.end <= start || segment.start >= end) continue;
      start = Math.min(start, segment.start);
      end = Math.max(end, segment.end);
      expanded = true;
    }
    return expanded ? { start, end } : null;
  }

  const pos = cursorStart;

  if (key === 'Backspace') {
    for (const segment of atomicSegments) {
      if (pos > segment.start && pos <= segment.end) {
        return { start: segment.start, end: segment.end };
      }
    }
    for (const segment of atomicSegments) {
      if (pos === segment.end) {
        return { start: segment.start, end: segment.end };
      }
    }
    return null;
  }

  for (const segment of atomicSegments) {
    if (pos >= segment.start && pos < segment.end) {
      return { start: segment.start, end: segment.end };
    }
  }
  for (const segment of atomicSegments) {
    if (pos === segment.start) {
      return { start: segment.start, end: segment.end };
    }
  }

  return null;
}
