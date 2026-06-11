import { useMemo, useRef, useState } from 'react';
import {
  FormulaEditLark,
  columnsToFieldList,
  toExecutableExpression,
  type FormulaEditLarkRef,
  type MethodItem,
  type TableColumn,
} from 'formula-edit-lark';
import 'formula-edit-lark/style.css';
import { evaluateFormula } from './formulaEngine';
import './App.css';

const TABLE_COLUMNS: TableColumn[] = [
  { title: '文本', field: 'text', type: '文本' },
  { title: '单选', field: 'choice', type: '单选' },
  { title: '单价', field: 'price', type: '数字' },
  { title: '数量', field: 'num', type: '数字' },
];

const METHOD_LIST: MethodItem[] = [
  {
    name: 'AND',
    value: 'AND(,)',
    realValue: 'and',
    category: '逻辑函数',
    syntax: 'AND(logical_expression1, [logical_expression2, ...])',
    description: '如果所有参数均为 true，则返回 true；否则返回 false',
    example: 'AND(TRUE, TRUE)\n= true',
  },
  {
    name: 'CONTAIN',
    value: 'CONTAIN(,)',
    realValue: 'contain',
    category: '逻辑函数',
    syntax: 'CONTAIN(text, substring)',
    description: '判断第一个文本是否包含第二个文本',
    example: 'CONTAIN("hello", "ell")\n= true',
  },
  {
    name: 'IF',
    value: 'IF(,,)',
    realValue: 'if',
    category: '逻辑函数',
    syntax: 'IF(condition, value_if_true, value_if_false)',
    description: '条件判断：条件为真返回第二个参数，否则返回第三个参数',
    example: 'IF(@单价 > 100, "贵", "便宜")',
  },
  {
    name: 'ROUND',
    value: 'ROUND(,2)',
    realValue: 'round',
    category: '数学函数',
    syntax: 'ROUND(number, [digits])',
    description: '将数字四舍五入到指定小数位',
    example: 'ROUND(@单价 * @数量, 2)\n= 240',
  },
];

const SAMPLE_ROWS: Array<Record<string, number | string>> = [
  { id: 1, text: '商品A', choice: '是', price: 80, num: 3 },
  { id: 2, text: '商品B', choice: '否', price: 120, num: 5 },
  { id: 3, text: '商品C', choice: '是', price: 60, num: 2 },
];

const DEFAULT_FORMULA = 'ROUND(@price*@num,2)';

export default function App() {
  const editorRef = useRef<FormulaEditLarkRef>(null);
  const [formula, setFormula] = useState(DEFAULT_FORMULA);
  const fieldList = useMemo(() => columnsToFieldList(TABLE_COLUMNS), []);
  const defaultCn = 'ROUND(@单价*@数量,2)';
  const [cnFormula, setCnFormula] = useState(defaultCn);
  const [confirmed, setConfirmed] = useState(DEFAULT_FORMULA);

  const previewRows = useMemo(() => {
    const executable = toExecutableExpression(confirmed, fieldList, METHOD_LIST);
    return SAMPLE_ROWS.map((row) => ({
      ...row,
      result: evaluateFormula(executable, row),
    }));
  }, [confirmed, fieldList]);

  return (
    <div className="app">
      <header>
        <h1>Formula Editor · 飞书风格底部提示面板</h1>
        <p>
          基于 <a href="https://github.com/tntd/formula-editor">tntd/formula-editor</a> 的{' '}
          <code>@字段</code> / <code>#函数</code> 语法，新增底部双栏提示，字段与表头联动。
        </p>
      </header>

      <section className="layout">
        <div className="panel">
          <h2>公式编辑器</h2>
          <FormulaEditLark
            ref={editorRef}
            value={formula}
            fieldList={fieldList}
            methodList={METHOD_LIST}
            onChange={(enCode, payload) => {
              setFormula(enCode);
              setCnFormula(payload.cnCode);
            }}
            onConfirm={(enCode, payload) => {
              setConfirmed(enCode);
              setCnFormula(payload.cnCode);
            }}
          />
          <div className="formula-meta">
            <div>
              <span>展示公式（cnCode）</span>
              <code>{cnFormula}</code>
            </div>
            <div>
              <span>存储公式（enCode）</span>
              <code>{formula}</code>
            </div>
            <div>
              <span>确认后用于计算</span>
              <code>{confirmed}</code>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>数据表（字段来源）</h2>
          <table>
            <thead>
              <tr>
                {TABLE_COLUMNS.map((col) => (
                  <th key={col.field}>{col.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ROWS.map((row) => (
                <tr key={String(row.id)}>
                  {TABLE_COLUMNS.map((col) => (
                    <td key={col.field}>{row[col.field]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="hint">修改表头列后，重新生成 fieldList 即可同步到底部「字段引用」。</p>
        </div>
      </section>

      <section className="panel preview-panel">
        <h2>计算预览（点击「确认」后生效）</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              {TABLE_COLUMNS.map((col) => (
                <th key={col.field}>{col.title}</th>
              ))}
              <th>公式结果</th>
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row) => (
              <tr key={String(row.id)}>
                <td>{row.id}</td>
                {TABLE_COLUMNS.map((col) => (
                  <td key={col.field}>{row[col.field]}</td>
                ))}
                <td className={typeof row.result === 'string' && row.result.startsWith('错误') ? 'error' : ''}>
                  {row.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
