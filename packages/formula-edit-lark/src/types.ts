export type FieldItem = {
  name: string;
  value: string;
  type?: string;
  tag?: string;
  description?: string;
};

export type MethodItem = {
  name: string;
  value: string;
  realValue: string;
  description?: string;
  syntax?: string;
  example?: string;
  category?: string;
};

export type HintCategory = {
  key: string;
  label: string;
  insertType: 'field' | 'function';
  items: Array<FieldItem | MethodItem>;
};

export type TableColumn = {
  title: string;
  field: string;
  type: string;
};

export type SampleRow = Record<string, number | string>;
