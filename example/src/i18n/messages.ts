import type { TableColumn } from 'formula-edit-lark';

export type AppLocale = 'zh-CN' | 'en-US';

export type AppMessages = {
  title: string;
  subtitle: string;
  syntaxMode: string;
  language: string;
  langZh: string;
  langEn: string;
  syntaxAtHash: string;
  syntaxDot: string;
  syntaxMustache: string;
  editorPanel: string;
  cnCodeLabel: string;
  enCodeLabel: string;
  confirmedLabel: string;
  dataTablePanel: string;
  methodCountHint: string;
  previewPanel: string;
  previewHint: string;
  tablePanel: string;
  tableHint: string;
  formulaResult: string;
  cellPopupPanel: string;
  cellPopupHint: string;
  formulaColumnTitle: string;
  hoverToViewFormula: string;
  clickToEditFormula: string;
  errorPrefix: string;
  colText: string;
  colChoice: string;
  colDate: string;
  colPrice: string;
  colNum: string;
  colFormula: string;
  colAvgDiff: string;
  typeText: string;
  typeChoice: string;
  typeDate: string;
  typeNumber: string;
  typeFormula: string;
  tableMainName: string;
  tableStockName: string;
  stockCol: string;
  tablesListTitle: string;
  currentTablePanel: string;
  currentTableBadge: string;
  linkedTablePanel: string;
};

export const APP_LOCALES: Record<AppLocale, AppMessages> = {
  'zh-CN': {
    title: 'Formula Editor · 飞书风格底部提示面板',
    subtitle: '飞书风格公式编辑器：字段 pill 高亮、智能提示、多表引用。',
    syntaxMode: '语法模式',
    language: '语言',
    langZh: '中文',
    langEn: 'English',
    syntaxAtHash: '@字段 / #函数',
    syntaxDot: '#字段 / 函数（飞书风格）',
    syntaxMustache: '{{字段}} / 裸字母函数',
    editorPanel: '公式编辑器',
    cnCodeLabel: '展示公式（cnCode）',
    enCodeLabel: '存储公式（enCode）',
    confirmedLabel: '确认后用于计算',
    dataTablePanel: '数据表（字段来源）',
    methodCountHint: '共 {count} 个 Excel 常用函数可在底部面板选择。',
    previewPanel: '计算预览（点击「确认」后生效）',
    previewHint: '',
    tablePanel: '数据表与公式列',
    tableHint: '上方编辑器点击「确认」后更新公式列；悬停公式结果单元格可查看公式。',
    formulaResult: '公式结果',
    cellPopupPanel: '单元格公式弹层（CellPopup）',
    cellPopupHint:
      '点击公式列单元格，在下方弹出编辑器（含实时预览与确认）。',
    formulaColumnTitle: '公式结果',
    hoverToViewFormula: '悬停查看公式',
    clickToEditFormula: '点击编辑公式',
    errorPrefix: '错误',
    colText: '详细备注说明信息',
    colChoice: '收支',
    colDate: '交易日期',
    colPrice: '单价',
    colNum: '数量',
    colFormula: '当前统计月份',
    colAvgDiff: '距离平均值的差距',
    typeText: '文本',
    typeChoice: '单选',
    typeDate: '日期',
    typeNumber: '数字',
    typeFormula: '公式',
    tableMainName: '本表',
    tableStockName: '库存表',
    stockCol: '库存量',
    tablesListTitle: '数据表列表',
    currentTablePanel: '本表（当前编辑表）',
    currentTableBadge: '当前',
    linkedTablePanel: '关联表（可跨表引用字段）',
  },
  'en-US': {
    title: 'Formula Editor · Lark-style hint panel',
    subtitle: 'Lark-style formula editor with field pills, smart hints, and multi-table refs.',
    syntaxMode: 'Syntax',
    language: 'Language',
    langZh: '中文',
    langEn: 'English',
    syntaxAtHash: '@field / #func',
    syntaxDot: '#field / function (Lark style)',
    syntaxMustache: '{{field}} / bare-letter functions',
    editorPanel: 'Formula editor',
    cnCodeLabel: 'Display formula (cnCode)',
    enCodeLabel: 'Storage formula (enCode)',
    confirmedLabel: 'Applied on confirm',
    dataTablePanel: 'Data table (field source)',
    methodCountHint: '{count} common Excel functions available in the hint panel.',
    previewPanel: 'Calculation preview (after confirm)',
    previewHint: '',
    tablePanel: 'Data table & formula column',
    tableHint:
      'Confirm in the editor above to update the formula column. Hover a formula cell to view the formula.',
    formulaResult: 'Result',
    cellPopupPanel: 'Cell popup (CellPopup)',
    cellPopupHint: 'Click a formula cell to open the editor below it (live preview + confirm).',
    formulaColumnTitle: 'Formula result',
    hoverToViewFormula: 'Hover to view formula',
    clickToEditFormula: 'Click to edit formula',
    errorPrefix: 'Error',
    colText: 'Detailed order notes',
    colChoice: 'Category',
    colDate: 'Trade date',
    colPrice: 'Unit price',
    colNum: 'Qty',
    colFormula: 'Current stat month',
    colAvgDiff: 'Diff from average',
    typeText: 'Text',
    typeChoice: 'Single select',
    typeDate: 'Date',
    typeNumber: 'Number',
    typeFormula: 'Formula',
    tableMainName: 'Main',
    tableStockName: 'Inventory',
    stockCol: 'Stock qty',
    tablesListTitle: 'Tables',
    currentTablePanel: 'Current table (editing)',
    currentTableBadge: 'Current',
    linkedTablePanel: 'Linked table (cross-table field refs)',
  },
};

export function resolveAppMessages(locale: AppLocale): AppMessages {
  return APP_LOCALES[locale] ?? APP_LOCALES['zh-CN'];
}

export function formatAppMessage(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

export function getTableColumns(messages: AppMessages): TableColumn[] {
  return [
    { title: messages.colText, field: 'text', type: messages.typeText, iconType: 'text' },
    { title: messages.colDate, field: 'date', type: messages.typeDate, iconType: 'date' },
    { title: messages.colChoice, field: 'choice', type: messages.typeChoice, iconType: 'select' },
    { title: messages.colPrice, field: 'price', type: messages.typeNumber, iconType: 'number' },
    { title: messages.colNum, field: 'num', type: messages.typeNumber, iconType: 'number' },
    { title: messages.colFormula, field: 'month', type: messages.typeFormula, iconType: 'formula' },
  ];
}

export type SampleRow = Record<string, number | string> & { id: number };

export function getSampleRows(messages: AppMessages): SampleRow[] {
  const isZh = messages.errorPrefix === '错误';
  return [
    {
      id: 1,
      text: isZh ? '商品A' : 'Product A',
      date: isZh ? '2026-01-15' : '2026-01-15',
      choice: isZh ? '收入' : 'Income',
      price: 80,
      num: 3,
      month: isZh ? '1月' : 'Jan',
    },
    {
      id: 2,
      text: isZh ? '商品B' : 'Product B',
      date: isZh ? '2026-02-20' : '2026-02-20',
      choice: isZh ? '支出' : 'Expense',
      price: 120,
      num: 5,
      month: isZh ? '2月' : 'Feb',
    },
    {
      id: 3,
      text: isZh ? '商品C' : 'Product C',
      date: isZh ? '2026-03-10' : '2026-03-10',
      choice: isZh ? '收入' : 'Income',
      price: 60,
      num: 2,
      month: isZh ? '3月' : 'Mar',
    },
  ];
}
