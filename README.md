# formula-edit-lark

React 计算公式编辑器，兼容 [tntd/formula-editor](https://github.com/tntd/formula-editor) 的 `@字段` / 函数语法，扩展飞书（Lark）风格底部双栏提示面板。

## 安装

```bash
npm install formula-edit-lark
# 或
yarn add formula-edit-lark
```

## 快速开始

```tsx
import { useMemo, useState } from 'react';
import {
  FormulaEdit,
  columnsToFieldList,
  type MethodItem,
} from 'formula-edit-lark';
import 'formula-edit-lark/style.css';

const tableColumns = [
  { title: '单价', field: 'price', type: '数字' },
  { title: '数量', field: 'num', type: '数字' },
];

const methodList: MethodItem[] = [
  {
    name: 'ROUND',
    value: 'ROUND(,2)',
    realValue: 'round',
    category: '数学函数',
    syntax: 'ROUND(number, [digits])',
    description: '将数字四舍五入到指定小数位',
  },
];

export function Demo() {
  const [formula, setFormula] = useState('ROUND(@price*@num,2)');
  const fieldList = useMemo(() => columnsToFieldList(tableColumns), []);

  return (
    <FormulaEdit
      value={formula}
      fieldList={fieldList}
      methodList={methodList}
      onChange={(enCode) => setFormula(enCode)}
      onConfirm={(enCode) => console.log('confirmed', enCode)}
    />
  );
}
```

## API

### 组件

| 导出 | 说明 |
|------|------|
| `FormulaEdit` / `FormulaEditLark` | 主编辑器组件 |
| `HintPanel` | 底部提示面板（可单独使用） |

### 工具函数

| 函数 | 说明 |
|------|------|
| `columnsToFieldList` | 表头列 → `fieldList` |
| `cnCodeToEn` | 展示态 → 存储态 |
| `enCodeToCn` | 存储态 → 展示态 |
| `toExecutableExpression` | 转为可执行表达式 |
| `getTriggerContext` | 检测光标处 @字段 / 函数输入 |
| `filterHintItems` | 过滤提示项 |

### Props

```tsx
type FormulaEditLarkProps = {
  value?: string;
  fieldList: FieldItem[];
  methodList: MethodItem[];
  placeholder?: string;
  onChange?: (enCode: string, payload: { cnCode: string; enCode: string }) => void;
  onConfirm?: (enCode: string, payload: { cnCode: string; enCode: string }) => void;
};
```

### Ref

```tsx
type FormulaEditLarkRef = {
  insertValue: (text: string) => void;
  getCnCode: () => string;
  getEnCode: () => string;
};
```

## 功能

- 输入 `@` 引用字段，自动过滤、Tab 补全
- 直接输入字母（如 `A`）引用函数，联动底部提示
- 底部左侧：字段 / 函数列表；右侧：语法、说明、示例
- 兼容 tntd 的 cnCode / enCode 编解码

## 本地开发

```bash
# 安装依赖
npm install

# 构建库 + 启动 demo
npm run dev

# 仅构建库
npm run build:lib
```

## 部署到 Vercel

项目根目录已包含 `vercel.json`，将 `example/` 构建为静态站点发布。

1. 在 [Vercel](https://vercel.com) 导入本仓库
2. **Root Directory** 保持为仓库根目录（`.`）
3. Vercel 会自动读取配置：
   - **Install Command**: `npm install`
   - **Build Command**: `npm run build`（先构建 `formula-edit-lark` 库，再构建 demo）
   - **Output Directory**: `example/dist`

也可使用 CLI：

```bash
npm i -g vercel
vercel
```

## 目录结构

```
packages/formula-edit-lark/   # 可发布的 React UI 库
example/                      # 接入示例（含公式计算预览）
```

## License

MIT
