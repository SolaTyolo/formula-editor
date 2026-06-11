# formula-edit-lark

[English README](./README.md)

React 飞书风格公式编辑器：字段 pill 高亮、底部智能提示、多表引用。

## 功能特性

- **字段高亮**：CodeMirror 6 pill 标签，括号匹配；原子 token（方向键整段跳过，选中时实心高亮）
- **CellPopup / CellHoverPreview**：单元格下方弹层编辑，或悬停预览公式
- **智能提示**：输入 `{{` 或函数字母过滤，Tab 补全
- **多表引用**：注入 `tables`，跨表 `table.column` pill
- **i18n**：内置 `zh-CN` / `en-US`，支持自定义文案
- **语法**：内置 `mustache` 预设（`{{字段}}` + 裸字母函数）；可传自定义 `EditorSyntax`
- **主题定制**：CSS 变量 + `classNames`（Tailwind 注入模式，无独立 CSS 包）
- **40+ Excel 函数**：示例内置常用表格函数

## 安装

```bash
npm install formula-edit-lark tailwindcss
```

## 快速开始

在应用入口 CSS 中启用 Tailwind 注入模式：

```css
@import 'tailwindcss';
@source '../node_modules/formula-edit-lark/dist';
```

开发时若 alias 到源码目录，可改为 `@source '../node_modules/formula-edit-lark/src'`。

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
      locale="zh-CN"
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

`value` / `onChange` / `onConfirm` 使用 **enCode**（存储态）；编辑器内部展示 **cnCode**（本地化字段名）。

## 单元格公式弹层（CellPopup）

点击表格「公式列」单元格，在下方弹出编辑器：字段 pill、实时预览（`= 5.375`）、确认按钮。完整示例见 `example/src/FormulaCellTable.tsx`。

## 多表引用

注入多张表；本表字段只显示列名，跨表字段为 `table.column` pill。

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
    name: '本表',
    columns: [
      { title: '单价', field: 'price', type: '数字' },
      { title: '数量', field: 'num', type: '数字' },
    ],
    rows: [{ id: 1, price: 80, num: 3 }],
  },
  {
    id: 'stock',
    name: '库存表',
    columns: [{ title: '库存量', field: 'stock', type: '数字' }],
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

| 引用类型 | 展示态 (cnCode) | 存储态 (enCode) |
|----------|-----------------|-----------------|
| 本表字段 | `{{单价}}` | `{{main.price}}` |
| 跨表字段 | `{{库存表.库存量}}` | `{{stock.stock}}` |
| 表引用 | `{{库存表}}` | `{{stock}}` |

表的 **id**（`main`、`stock`）和列 **field**（`price`、`stock`）为稳定标识；**name**（库存表、单价）随语言变化。

## 语法（syntax）

内置预设：

| 预设 | 字段 | 函数 | 说明 |
|------|------|------|------|
| `mustache`（默认） | `{{单价}}` | `IF(...)`、`ROUND(...)` | 双花括号字段 + 裸字母函数 |

存储态：字段为 `{{table.field}}` / `{{table}}`；函数保持裸名（如 `IF(...)`），不加 `#`。旧版 `@field`、`#func` enCode 仍可解码兼容。

可通过 `EditorSyntax` 自定义触发符号。

## 求值

```tsx
import { resolveForEvaluation } from 'formula-edit-lark';

const executable = resolveForEvaluation(enCode, fieldList, methodList, evaluateContext);
// 将 {{main.date}} 等替换为当前行标量后，交给 formulajs / 自研引擎执行
```

## i18n

```tsx
<EditLark locale="en-US" />
<EditLark locale="zh-CN" messages={{ confirm: '应用' }} />
```

## 主题与样式

```tsx
<EditLark
  theme={{
    '--fel-primary': '#6366f1',
    '--fel-field-bg': '#eef2ff',
    '--fel-field-border': '#818cf8',
    '--fel-field-active-bg': '#6366f1',
    '--fel-field-active-color': '#ffffff',
  }}
/>
```

## API

### 组件

| 导出 | 说明 |
|------|------|
| `EditLark` | 主编辑器 |
| `CellPopup` | 单元格弹层编辑器 |
| `CellHoverPreview` | 悬停公式预览 |
| `HintPanel` | 提示面板（可单独使用） |
| `ReadonlyPreview` | 只读高亮预览 |
| `HighlightContent` | pill 渲染（自定义布局） |

### 工具函数

| 函数 | 说明 |
|------|------|
| `columnsToFieldList` | 单表列 → `fieldList` |
| `tablesToFieldList` | 多表 → `fieldList` |
| `resolveForEvaluation` | enCode + 上下文 → 可执行表达式 |
| `cnCodeToEn` / `enCodeToCn` | 展示态 ↔ 存储态 |
| `getTriggerContext` | 光标处触发上下文 |

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

## 本地开发

```bash
npm install
npm run dev
npm test          # 单元测试
npm run ci        # test + build（与 GitHub Actions 一致）
npm run version:patch   # bump 库版本（CI 自动打 tag + Release）
```

发布流程：`npm run version:patch` → commit → push `main` → 自动创建 `vX.Y.Z` tag 与 GitHub Release → 自动发布 npm。详见 [PUBLISHING.md](./PUBLISHING.md)。

## License

MIT
