import type { EditClassNames, EditTheme } from 'formula-edit-lark';

/** Indigo theme — main demo editor */
export const EDIT_THEME: EditTheme = {
  '--fel-primary': '#6366f1',
  '--fel-primary-hover': '#4f46e5',
  '--fel-border': '#c7d2fe',
  '--fel-bg': '#ffffff',
  '--fel-text': '#1e1b4b',
  '--fel-muted': '#64748b',
  '--fel-field-bg': '#eef2ff',
  '--fel-field-border': '#818cf8',
  '--fel-field-color': '#4338ca',
  '--fel-field-active-bg': '#6366f1',
  '--fel-field-active-color': '#ffffff',
  '--fel-hint-active-bg': '#e0e7ff',
  '--fel-match-bg': '#fef9c3',
  '--fel-radius': '8px',
};

/** CSS class for previews without a root `theme` prop (e.g. hover popup) */
export const EDIT_THEME_CLASS = 'fel-example-theme';

export type ThemePresetId = 'minimal' | 'default' | 'indigo' | 'rose' | 'ocean' | 'dark';

export type ThemePreset = {
  id: ThemePresetId;
  /** `theme` prop — CSS variables on editor root */
  theme?: EditTheme;
  /** Extra root / region classes (see editorTheme.css) */
  classNames?: EditClassNames;
};

/** Library default — no overrides */
export const THEME_DEFAULT: ThemePreset = {
  id: 'default',
};

/** Minimal borderless — transparent chrome, no outer border/shadow */
export const THEME_MINIMAL: ThemePreset = {
  id: 'minimal',
  theme: {
    '--fel-border': 'transparent',
    '--fel-bg': 'transparent',
    '--fel-radius': '0',
    '--fel-hint-active-bg': 'rgba(20, 86, 240, 0.06)',
  },
  classNames: {
    root: 'fel-example-minimal',
    toolbar: 'fel-example-minimal__toolbar',
    hintPanel: 'fel-example-minimal__hint',
    hintList: 'fel-example-minimal__hintList',
    hintDetail: 'fel-example-minimal__hintDetail',
    confirm: 'fel-example-minimal__confirm',
  },
};

export const THEME_INDIGO: ThemePreset = {
  id: 'indigo',
  theme: EDIT_THEME,
};

/** Warm rose — pink pills + coral primary */
export const THEME_ROSE: ThemePreset = {
  id: 'rose',
  theme: {
    '--fel-primary': '#e11d48',
    '--fel-primary-hover': '#be123c',
    '--fel-border': '#fecdd3',
    '--fel-bg': '#fff1f2',
    '--fel-text': '#881337',
    '--fel-muted': '#9f1239',
    '--fel-field-bg': '#ffe4e6',
    '--fel-field-border': '#fb7185',
    '--fel-field-color': '#be123c',
    '--fel-field-active-bg': '#e11d48',
    '--fel-field-active-color': '#ffffff',
    '--fel-hint-active-bg': '#ffe4e6',
    '--fel-match-bg': '#fef08a',
    '--fel-radius': '10px',
  },
};

/** Ocean teal */
export const THEME_OCEAN: ThemePreset = {
  id: 'ocean',
  theme: {
    '--fel-primary': '#0d9488',
    '--fel-primary-hover': '#0f766e',
    '--fel-border': '#99f6e4',
    '--fel-bg': '#f0fdfa',
    '--fel-text': '#134e4a',
    '--fel-muted': '#5eead4',
    '--fel-field-bg': '#ccfbf1',
    '--fel-field-border': '#2dd4bf',
    '--fel-field-color': '#0f766e',
    '--fel-field-active-bg': '#0d9488',
    '--fel-field-active-color': '#ffffff',
    '--fel-hint-active-bg': '#ccfbf1',
    '--fel-match-bg': '#fde68a',
    '--fel-radius': '8px',
  },
};

/** Dark slate — dark surface, light text */
export const THEME_DARK: ThemePreset = {
  id: 'dark',
  theme: {
    '--fel-primary': '#818cf8',
    '--fel-primary-hover': '#6366f1',
    '--fel-border': '#334155',
    '--fel-bg': '#1e293b',
    '--fel-text': '#f1f5f9',
    '--fel-muted': '#94a3b8',
    '--fel-field-bg': '#334155',
    '--fel-field-border': '#64748b',
    '--fel-field-color': '#a5b4fc',
    '--fel-field-active-bg': '#6366f1',
    '--fel-field-active-color': '#ffffff',
    '--fel-hint-active-bg': '#334155',
    '--fel-match-bg': '#854d0e',
    '--fel-radius': '8px',
  },
  classNames: {
    root: 'fel-example-dark',
    hintPanel: 'fel-example-dark__hint',
    hintList: 'fel-example-dark__hintList',
    hintDetail: 'fel-example-dark__hintDetail',
  },
};

export const THEME_PRESETS: ThemePreset[] = [
  THEME_MINIMAL,
  THEME_DEFAULT,
  THEME_INDIGO,
  THEME_ROSE,
  THEME_OCEAN,
  THEME_DARK,
];
