# formula-edit-lark

React formula editor with Lark-style hint panel and field pills. See [中文文档](./README.zh-CN.md).

## Features

- Field pill highlighting via CodeMirror 6 replace widgets
- Bracket matching aligned with document positions
- Atomic field tokens (arrow keys skip whole `{{field}}`; focused pill solid highlight)
- Smart autocomplete with `{{` triggers and bare-letter function names; Tab to insert
- **CellPopup** / **CellHoverPreview**: editor anchored to or hovering over a table cell
- Multi-table field refs (`table.column` pills)
- i18n: `zh-CN` / `en-US` + custom messages
- Syntax: `{{field}}` mustache tokens (built-in preset) + bare-letter functions
- Theme via bundled CSS (BEM + CSS variables), `theme` prop, and `classNames` overrides
- 40+ Excel-style functions in the demo

## Install

```bash
npm install formula-edit-lark
```

## Quick start

Import the editor — default styles are included automatically:

```tsx
import { EditLark } from 'formula-edit-lark';
```

Or load styles explicitly:

```tsx
import 'formula-edit-lark/style.css';
```

```tsx
import { useMemo, useState } from 'react';
import { EditLark, columnsToFieldList } from 'formula-edit-lark';

export function Demo() {
  const [formula, setFormula] = useState('ROUND({{main.price}}*{{main.num}},2)');
  const fieldList = useMemo(() => columnsToFieldList(columns), []);

  return (
    <EditLark
      value={formula}
      fieldList={fieldList}
      methodList={methodList}
      syntax="mustache"
      locale="en-US"
      highlight
      onChange={(enCode, { cnCode }) => {
        setFormula(enCode);
        console.log(cnCode);
      }}
      onConfirm={(enCode) => console.log(enCode)}
    />
  );
}
```

`value` / `onChange` / `onConfirm` use **enCode** (storage). The editor renders **cnCode** (localized display labels) internally.

## Cell popup (CellPopup)

Click a formula cell to open an editor below it: field pills, live preview (`= 5.375`), and confirm. See `example/src/FormulaCellTable.tsx`.

## Multi-table refs

Pass `tables`; fields on the current table show column titles only; cross-table fields render as `table.column` pills.

```tsx
import {
  EditLark,
  tablesToFieldList,
  resolveForEvaluation,
  type TableSource,
  type EvaluateContext,
} from 'formula-edit-lark';

const tables: TableSource[] = [
  {
    id: 'main',
    name: 'Main',
    columns: [
      { title: 'Unit price', field: 'price', type: 'Number' },
      { title: 'Qty', field: 'num', type: 'Number' },
    ],
    rows: [{ id: 1, price: 80, num: 3 }],
  },
  {
    id: 'stock',
    name: 'Inventory',
    columns: [{ title: 'Stock qty', field: 'stock', type: 'Number' }],
    rows: [{ id: 1, stock: 100 }],
  },
];

const fieldList = tablesToFieldList(tables, { currentTableId: 'main' });

<EditLark
  fieldList={fieldList}
  tables={tables}
  currentTableId="main"
  syntax="mustache"
  methodList={methodList}
/>;
```

| Ref type | Display (cnCode) | Storage (enCode) |
|----------|------------------|------------------|
| Current-table field | `{{Unit price}}` | `{{main.price}}` |
| Cross-table field | `{{Inventory.Stock qty}}` | `{{stock.stock}}` |
| Table only | `{{Inventory}}` | `{{stock}}` |

Table/column **ids** (`main`, `stock`, `price`) are stable; **names** (`Inventory`, `Unit price`) follow locale.

## Syntax

Built-in preset:

| Preset | Fields | Functions | Notes |
|--------|--------|-----------|-------|
| `mustache` (default) | `{{Price}}` | `IF(...)`, `ROUND(...)` | Double-brace fields, bare function names |

Storage uses `{{table.field}}` / `{{table}}` for fields; functions stay as bare names (e.g. `IF(...)`), not `#if`. Legacy `@field` and `#func` enCode still decode for compatibility.

You may pass a custom `EditorSyntax` object for other trigger patterns.

## Evaluation

```tsx
import { resolveForEvaluation } from 'formula-edit-lark';

const executable = resolveForEvaluation(enCode, fieldList, methodList, evaluateContext);
// e.g. IF('2026-01-15'>'2020-01-01', 'Jan', 100) → run with formulajs / your engine
```

## i18n

```tsx
<EditLark locale="en-US" />
<EditLark locale="zh-CN" messages={{ confirm: '应用' }} />
```

## Theme

Styles follow the amis **InputFormula** pattern: BEM classes (`.fel-*`) with CSS custom properties on the root.

```tsx
<EditLark
  theme={{
    '--fel-primary': '#6366f1',
    '--fel-field-bg': '#eef2ff',
    '--fel-field-border': '#818cf8',
    '--fel-field-active-bg': '#6366f1',
    '--fel-field-active-color': '#ffffff',
  }}
  classNames={{ hintPanel: 'my-hint-panel' }}
/>
```

For portals or previews without a root `theme` prop, wrap with a class that sets the same variables (see `example/src/editorTheme.css`).

## API

### Components

| Export | Description |
|--------|-------------|
| `EditLark` | Main editor |
| `CellPopup` | Cell-anchored popup editor |
| `CellHoverPreview` | Hover tooltip showing formula |
| `HintPanel` | Hint panel (standalone) |
| `ReadonlyPreview` | Read-only highlighted formula |
| `HighlightContent` | Pill renderer for custom layouts |

### Utilities

| Function | Description |
|----------|-------------|
| `columnsToFieldList` | Single-table columns → `fieldList` |
| `tablesToFieldList` | Multi-table → `fieldList` |
| `resolveForEvaluation` | enCode + context → executable expression |
| `cnCodeToEn` / `enCodeToCn` | Display ↔ storage codec |
| `getTriggerContext` | Cursor trigger detection |

### Props

```tsx
type EditLarkProps = {
  value?: string; // enCode
  fieldList: FieldItem[];
  methodList: MethodItem[];
  tables?: TableSource[];
  currentTableId?: string;
  syntax?: EditorSyntax | 'mustache';
  locale?: 'zh-CN' | 'en-US' | Partial<LocaleMessages>;
  theme?: EditTheme;
  classNames?: EditClassNames;
  highlight?: boolean;
  renderFieldIcon?: FieldIconRenderer;
  renderTableIcon?: TableIconRenderer;
  mode?: 'default' | 'cell';
  onChange?: (enCode: string, payload: { cnCode: string; enCode: string }) => void;
  onConfirm?: (enCode: string, payload: { cnCode: string; enCode: string }) => void;
};
```

## Local development

```bash
npm install
npm run dev
npm test          # unit tests
npm run ci        # test + build (same as GitHub Actions)
npm run version:patch   # bump library version (CI auto-tags + Release)
```

Release flow: `npm run version:patch` → commit → push `main` → auto `vX.Y.Z` tag + GitHub Release → npm publish. See [PUBLISHING.md](./PUBLISHING.md).

## License

MIT
