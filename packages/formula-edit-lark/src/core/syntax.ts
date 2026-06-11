import type { EditorSyntax } from '../types';

/** Mustache field syntax: {{field}} + bare-letter functions */
export const SYNTAX_MUSTACHE: EditorSyntax = {
  preset: 'mustache',
  field: { trigger: '{{', close: '}}' },
  function: { trigger: '', bareLetter: true },
};

export const SYNTAX_PRESETS = {
  mustache: SYNTAX_MUSTACHE,
} as const;

export type SyntaxPresetName = keyof typeof SYNTAX_PRESETS;

export function resolveSyntax(
  syntax?: EditorSyntax | SyntaxPresetName,
): EditorSyntax {
  if (!syntax) return SYNTAX_MUSTACHE;
  if (typeof syntax === 'string') return SYNTAX_PRESETS[syntax] ?? SYNTAX_MUSTACHE;
  return syntax;
}

export function formatFieldToken(name: string, syntax: EditorSyntax = SYNTAX_MUSTACHE): string {
  if (syntax.field.close) {
    return `${syntax.field.trigger}${name}${syntax.field.close}`;
  }
  return `${syntax.field.trigger}${name}`;
}

export function formatFunctionTriggerLabel(syntax: EditorSyntax, query: string): string {
  if (syntax.function.trigger) return `${syntax.function.trigger}${query || '…'}`;
  return query || '…';
}

export function formatFieldTriggerLabel(syntax: EditorSyntax, query: string): string {
  if (syntax.field.close) {
    return `${syntax.field.trigger}${query}${query ? '' : '…'}`;
  }
  return `${syntax.field.trigger}${query || '…'}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function formatTableRefToken(tableName: string, syntax: EditorSyntax = SYNTAX_MUSTACHE): string {
  return formatFieldToken(tableName, syntax);
}

/** Table token: {{tableName}} */
export function buildTableTokenRegExp(
  tableNames: string[],
  syntax: EditorSyntax,
): RegExp | null {
  if (tableNames.length === 0) return null;
  const names = [...tableNames].sort((a, b) => b.length - a.length).map(escapeRegExp);
  const alt = names.join('|');
  const open = escapeRegExp(syntax.field.trigger);
  const close = escapeRegExp(syntax.field.close ?? '');
  return new RegExp(`${open}(${alt})${close}`, 'g');
}

/** Field token: {{tokenName}} */
export function buildFieldTokenRegExp(
  fieldList: Array<{ name: string; tokenName?: string }>,
  syntax: EditorSyntax,
): RegExp | null {
  if (fieldList.length === 0) return null;
  const names = fieldList
    .map((f) => escapeRegExp(f.tokenName ?? f.name))
    .sort((a, b) => b.length - a.length);
  const alt = names.join('|');
  const open = escapeRegExp(syntax.field.trigger);
  const close = escapeRegExp(syntax.field.close ?? '');
  return new RegExp(`${open}(${alt})${close}`, 'g');
}

/** Allowed characters while typing inside {{ … */
export function getFieldQueryPattern(syntax: EditorSyntax): RegExp {
  if (syntax.field.close) {
    return new RegExp(`^[^${escapeRegExp(syntax.field.close)}]*$`);
  }
  return /^[^\s+\-*\/#%(),;!<>=@.{}]*$/;
}

export function getFunctionQueryPattern(): RegExp {
  return /^[A-Za-z]*$/;
}

export function getFunctionPrefixPattern(_syntax: EditorSyntax): RegExp {
  return /[(\s,+\-*\/=<>!&|]/;
}

export function formatFunctionToken(value: string, syntax: EditorSyntax): string {
  if (!syntax.function.trigger) return value;
  if (value.startsWith(syntax.function.trigger)) return value;
  return `${syntax.function.trigger}${value}`;
}
