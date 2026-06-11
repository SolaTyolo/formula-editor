import type { EditTheme } from 'formula-edit-lark';

/** Custom indigo theme — inject via `theme` prop to replace the default green pills */
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

/** CSS class for previews without a root `theme` prop (CSS variables inherit to children) */
export const EDIT_THEME_CLASS = 'fel-example-theme';
