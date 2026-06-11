import type { FieldItem, EvaluateContext, MethodItem } from '../types';

export const demoFields: FieldItem[] = [
  {
    name: '单价',
    tokenName: '单价',
    label: '单价',
    value: 'main.price',
    tableId: 'main',
    columnTitle: '单价',
    isCurrentTable: true,
    type: '数字',
  },
  {
    name: '数量',
    tokenName: '数量',
    label: '数量',
    value: 'main.num',
    tableId: 'main',
    columnTitle: '数量',
    isCurrentTable: true,
    type: '数字',
  },
  {
    name: '库存表.库存量',
    tokenName: '库存表.库存量',
    label: '库存量',
    value: 'stock.stock',
    tableId: 'stock',
    tableName: '库存表',
    columnTitle: '库存量',
    isCurrentTable: false,
    type: '数字',
  },
];

export const demoMethods: MethodItem[] = [
  {
    name: 'ROUND',
    value: 'ROUND()',
    realValue: 'round',
    category: '数学函数',
  },
  {
    name: 'AVERAGE',
    value: 'AVERAGE()',
    realValue: 'average',
    category: '数学函数',
  },
  {
    name: 'AVG',
    value: 'AVG()',
    realValue: 'average',
    category: '数学函数',
  },
];

export const demoEvaluateContext: EvaluateContext = {
  currentTableId: 'main',
  currentRowId: 1,
  currentRow: { id: 1, price: 80, num: 3 },
  tables: [
    {
      id: 'main',
      name: '本表',
      columns: [
        { title: '单价', field: 'price', type: '数字' },
        { title: '数量', field: 'num', type: '数字' },
      ],
      rows: [
        { id: 1, price: 80, num: 3 },
        { id: 2, price: 120, num: 5 },
        { id: 3, price: 60, num: 2 },
      ],
    },
    {
      id: 'stock',
      name: '库存表',
      columns: [{ title: '库存量', field: 'stock', type: '数字' }],
      rows: [{ id: 1, stock: 100 }],
    },
  ],
};
