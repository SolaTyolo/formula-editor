# formula-edit-lark

React formula editor with Lark-style hint panel and field pills.

## Styling

This package uses **Tailwind CSS v4 source injection** — no bundled CSS file.

In your app entry CSS:

```css
@import 'tailwindcss';
@source '../node_modules/formula-edit-lark/dist';
```

## Build outputs

- `formula-edit-lark.js` (ESM)
- `formula-edit-lark.cjs` (CJS)
- Type declarations

## Source layout

```
src/
  core/          # codec, syntax, segments, hint logic, tables
  ui/
    editor/      # EditLark, EditorInput, HighlightContent
    hint/        # HintPanel
    preview/     # ReadonlyPreview, CellHoverPreview
    popup/       # CellPopup
    icons/       # FieldTypeIcon (inline SVG)
  i18n/
  types.ts
  index.ts
```
