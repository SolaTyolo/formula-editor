import { EditorView, keymap } from '@codemirror/view';
import {
  getAtomicArrowPos,
  getAtomicArrowPosWithSelection,
  getAtomicDeleteRange,
  snapSelectionOutOfAtomicSegments,
} from '../../../core/token-delete';
import type { FormulaEditorContext } from './context';

export type FormulaEditorInteraction = {
  onHintKeyDown?: (view: EditorView, key: string) => boolean;
};

export function createInteractionExtensions(
  getContext: () => FormulaEditorContext,
  getInteraction: () => FormulaEditorInteraction,
) {
  const atomicKeymap = keymap.of([
    {
      key: 'Backspace',
      run(view) {
        const { from, to } = view.state.selection.main;
        const text = view.state.doc.toString();
        const ctx = getContext();
        const range = getAtomicDeleteRange(
          text,
          from,
          to,
          'Backspace',
          ctx.fieldList,
          ctx.methodList,
          ctx.syntax,
          ctx.tableNames,
        );
        if (!range) return false;
        view.dispatch({ changes: { from: range.start, to: range.end }, selection: { anchor: range.start } });
        return true;
      },
    },
    {
      key: 'Delete',
      run(view) {
        const { from, to } = view.state.selection.main;
        const text = view.state.doc.toString();
        const ctx = getContext();
        const range = getAtomicDeleteRange(
          text,
          from,
          to,
          'Delete',
          ctx.fieldList,
          ctx.methodList,
          ctx.syntax,
          ctx.tableNames,
        );
        if (!range) return false;
        view.dispatch({ changes: { from: range.start, to: range.end }, selection: { anchor: range.start } });
        return true;
      },
    },
    {
      key: 'ArrowLeft',
      run(view) {
        const { from, to } = view.state.selection.main;
        const selFrom = Math.min(from, to);
        const selTo = Math.max(from, to);
        const ctx = getContext();
        const text = view.state.doc.toString();

        if (selFrom !== selTo) {
          const next = getAtomicArrowPosWithSelection(
            text,
            selFrom,
            selTo,
            'ArrowLeft',
            ctx.fieldList,
            ctx.methodList,
            ctx.syntax,
            ctx.tableNames,
          );
          if (next !== null) {
            view.dispatch({ selection: { anchor: next } });
            return true;
          }
          return false;
        }

        const next = getAtomicArrowPos(
          text,
          from,
          'ArrowLeft',
          ctx.fieldList,
          ctx.methodList,
          ctx.syntax,
          ctx.tableNames,
        );
        if (next === null || next === from) return false;
        view.dispatch({ selection: { anchor: next } });
        return true;
      },
    },
    {
      key: 'ArrowRight',
      run(view) {
        const { from, to } = view.state.selection.main;
        const selFrom = Math.min(from, to);
        const selTo = Math.max(from, to);
        const ctx = getContext();
        const text = view.state.doc.toString();

        if (selFrom !== selTo) {
          const next = getAtomicArrowPosWithSelection(
            text,
            selFrom,
            selTo,
            'ArrowRight',
            ctx.fieldList,
            ctx.methodList,
            ctx.syntax,
            ctx.tableNames,
          );
          if (next !== null) {
            view.dispatch({ selection: { anchor: next } });
            return true;
          }
          return false;
        }

        const next = getAtomicArrowPos(
          text,
          from,
          'ArrowRight',
          ctx.fieldList,
          ctx.methodList,
          ctx.syntax,
          ctx.tableNames,
        );
        if (next === null || next === from) return false;
        view.dispatch({ selection: { anchor: next } });
        return true;
      },
    },
    {
      key: 'ArrowUp',
      run(view) {
        return getInteraction().onHintKeyDown?.(view, 'ArrowUp') ?? false;
      },
    },
    {
      key: 'ArrowDown',
      run(view) {
        return getInteraction().onHintKeyDown?.(view, 'ArrowDown') ?? false;
      },
    },
    {
      key: 'Tab',
      run(view) {
        return getInteraction().onHintKeyDown?.(view, 'Tab') ?? false;
      },
    },
    {
      key: 'Enter',
      run(view) {
        return getInteraction().onHintKeyDown?.(view, 'Enter') ?? false;
      },
    },
  ]);

  const snapSelection = EditorView.updateListener.of((update) => {
    if (!update.selectionSet) return;
    const { from, to } = update.state.selection.main;
    const ctx = getContext();
    const snapped = snapSelectionOutOfAtomicSegments(
      update.state.doc.toString(),
      from,
      to,
      ctx.fieldList,
      ctx.methodList,
      ctx.syntax,
      ctx.tableNames,
    );
    if (snapped && (snapped.start !== from || snapped.end !== to)) {
      update.view.dispatch({ selection: { anchor: snapped.start, head: snapped.end } });
    }
  });

  return [atomicKeymap, snapSelection];
}
