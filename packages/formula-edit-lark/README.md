# formula-edit-lark

React formula editor with Lark-style hint panel and field pills.

## Styling

This package ships **built-in CSS** (amis-style: BEM class names + CSS variables). Styles load automatically when you import components:

```tsx
import { EditLark } from 'formula-edit-lark';
```

Or import the stylesheet explicitly:

```tsx
import 'formula-edit-lark/style.css';
```

### Theme tokens

Override CSS variables via the `theme` prop (inline on the editor root), or wrap with a custom class:

```tsx
<EditLark theme={{ '--fel-primary': '#6366f1' }} />
```

### Region classNames

Pass extra classes per region (similar to amis `className` / `variableClassName`):

```tsx
<EditLark classNames={{ hintPanel: 'my-hint-panel' }} />
```

## Build outputs

- `formula-edit-lark.js` (ESM)
- `formula-edit-lark.cjs` (CJS)
- `formula-edit-lark.css` (styles)
- Type declarations

## Source layout

```
src/
  style/         # formula-edit-lark.css (BEM + CSS variables)
  core/          # codec, syntax, segments, hint logic, tables
  ui/
    editor/      # EditLark, CodeMirrorEditor, HighlightContent
    hint/        # HintPanel
    preview/     # ReadonlyPreview, CellHoverPreview
    popup/       # CellPopup
    icons/       # FieldTypeIcon (inline SVG)
  i18n/
  types.ts
  index.ts
```
