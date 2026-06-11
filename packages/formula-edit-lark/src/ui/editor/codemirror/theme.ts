import { EditorView } from '@codemirror/view';
import type { EditClassNames } from '../../../types';

export function formulaEditorTheme(compact?: boolean, classNames?: EditClassNames) {
  const minHeight = compact ? '3.5rem' : '6rem';

  return EditorView.theme(
    {
      '&': {
        width: '100%',
        fontSize: '14px',
        lineHeight: '1.7',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      },
      '&.cm-focused': {
        outline: 'none',
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: 'inherit',
      },
      '.cm-content': {
        padding: 0,
        minHeight,
        caretColor: 'var(--fel-text, #1f2329)',
      },
      '.cm-line': {
        padding: 0,
      },
      '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: 'var(--fel-text, #1f2329)',
        borderLeftWidth: '1px',
      },
      '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: 'var(--fel-hint-active-bg, #e0e7ff) !important',
      },
      '.cm-activeLine': {
        backgroundColor: 'transparent',
      },
      '.cm-matchingBracket, .cm-nonmatchingBracket': {
        backgroundColor: 'var(--fel-match-bg, #fef9c3)',
        outline: '1px solid var(--fel-match-bg, #fef9c3)',
      },
      '.fel-cm-pill': {
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '4px',
        backgroundColor: 'var(--fel-field-bg, #e8f5e9)',
        boxShadow: 'inset 0 0 0 1px var(--fel-field-border, #81c784)',
        color: 'var(--fel-field-color, #2e7d32)',
        padding: '0 4px',
        margin: '0 1px',
        verticalAlign: 'baseline',
        lineHeight: 'inherit',
        font: 'inherit',
        transition: 'background-color 0.12s ease, color 0.12s ease, box-shadow 0.12s ease',
      },
      '.fel-cm-pill-active': {
        backgroundColor: 'var(--fel-field-active-bg, var(--fel-primary, #2e7d32))',
        boxShadow: 'none',
        color: 'var(--fel-field-active-color, #ffffff)',
      },
    },
    { dark: false },
  );
}

export function editorRootClassName(compact?: boolean, classNames?: EditClassNames) {
  return ['fel-cm-editor', compact && 'fel-cm-editor--compact', classNames?.editorInput]
    .filter(Boolean)
    .join(' ');
}
