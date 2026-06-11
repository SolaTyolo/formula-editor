import type { EditorSyntax } from '../../types';

export type EditorPillParts = {
  prefix: string;
  label: string;
  suffix: string;
};

/** Split token into hidden {{ }} wrappers + visible label (editor pills only) */
export function splitEditorPillDisplay(
  displayValue: string,
  syntax: EditorSyntax,
  _kind: 'field' | 'table',
): EditorPillParts {
  if (syntax.field.close) {
    const open = syntax.field.trigger;
    const close = syntax.field.close;
    if (displayValue.startsWith(open) && displayValue.endsWith(close)) {
      return {
        prefix: open,
        label: displayValue.slice(open.length, displayValue.length - close.length),
        suffix: close,
      };
    }
  }

  return { prefix: '', label: displayValue, suffix: '' };
}
