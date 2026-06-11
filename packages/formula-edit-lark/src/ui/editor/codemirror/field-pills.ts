import { RangeSetBuilder, type Extension } from '@codemirror/state';
import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view';
import { getFieldTokenName } from '../../../core/field-display';
import { parseSegments } from '../../../core/segments';
import { isAtomicSegmentActive } from '../../../core/token-delete';
import { splitEditorPillDisplay } from '../pill-display';
import type { FormulaEditorContext } from './context';
import { FieldPillWidget } from './field-pill-widget';

function buildPillDecorations(view: EditorView, context: FormulaEditorContext): DecorationSet {
  if (!context.highlight) return Decoration.none;

  const text = view.state.doc.toString();
  const segments = parseSegments(
    text,
    context.fieldList,
    context.methodList,
    context.syntax,
    context.tableNames,
  );

  const fieldByToken = new Map(context.fieldList.map((field) => [getFieldTokenName(field), field]));
  const builder = new RangeSetBuilder<Decoration>();
  const { from, to, head } = view.state.selection.main;
  const selFrom = Math.min(from, to);
  const selTo = Math.max(from, to);
  const cursor = from === to ? from : head;

  for (const segment of segments) {
    if (segment.type !== 'field' && segment.type !== 'table') continue;

    const kind = segment.type === 'table' ? 'table' : 'field';
    const { label } = splitEditorPillDisplay(segment.value, context.syntax, kind);
    const field = segment.type === 'field' ? fieldByToken.get(segment.name) : undefined;
    const active = isAtomicSegmentActive(segment, cursor, selFrom, selTo);

    builder.add(
      segment.start,
      segment.end,
      Decoration.replace({
        widget: new FieldPillWidget(label, field?.type, active),
        inclusive: false,
      }),
    );
  }

  return builder.finish();
}

export function fieldPillsExtension(getContext: () => FormulaEditorContext): Extension {
  const plugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildPillDecorations(view, getContext());
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          this.decorations = buildPillDecorations(update.view, getContext());
        }
      }
    },
    { decorations: (value) => value.decorations },
  );

  return [plugin];
}

export function atomicRangesExtension(getContext: () => FormulaEditorContext): Extension {
  return EditorView.atomicRanges.of((view) => {
    const context = getContext();
    const text = view.state.doc.toString();
    const segments = parseSegments(
      text,
      context.fieldList,
      context.methodList,
      context.syntax,
      context.tableNames,
    ).filter((segment) => segment.type === 'field' || segment.type === 'table');

    const builder = new RangeSetBuilder<Decoration>();
    for (const segment of segments) {
      builder.add(segment.start, segment.end, Decoration.mark({ class: 'fel-cm-atomic' }));
    }
    return builder.finish();
  });
}
