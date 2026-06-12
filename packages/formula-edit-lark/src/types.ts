/** Built-in icon types for pills and hint list; override via renderFieldIcon */
export type FieldIconType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'formula'
  | 'checkbox'
  | 'user'
  | 'attachment'
  | 'table';

export type FieldItem = {
  /** @deprecated Same as tokenName; kept for compatibility */
  name: string;
  /** cnCode match name (without trigger), e.g. `price` / `stock.qty` */
  tokenName?: string;
  /** Display name in hint list */
  label?: string;
  value: string;
  tableId?: string;
  /** Table name shown in pill / detail panel */
  tableName?: string;
  /** Column name shown in pill / detail panel */
  columnTitle?: string;
  /** Whether this field belongs to the table being edited (same-table pills omit table name) */
  isCurrentTable?: boolean;
  type?: string;
  /** Column icon type; inferred from type label when omitted */
  iconType?: FieldIconType;
  tag?: string;
  description?: string;
};

/** Injectable table reference inserted from the hint panel */
export type TableRefItem = {
  id: string;
  name: string;
  description?: string;
  iconType?: FieldIconType;
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
  insertType: 'field' | 'function' | 'table';
  items: Array<FieldItem | MethodItem | TableRefItem>;
};

/** Lark-style single-panel hint sections: fields / tables / functions */
export type HintListSection = {
  key: string;
  label: string;
  insertType: 'field' | 'table' | 'function';
  items: Array<FieldItem | TableRefItem | MethodItem>;
};

export type TableColumn = {
  title: string;
  field: string;
  type: string;
  iconType?: FieldIconType;
};

export type SampleRow = Record<string, number | string>;

/** Injectable multi-table data sources */
export type TableSource = {
  id: string;
  name: string;
  columns: TableColumn[];
  rows?: SampleRow[];
};

/** Evaluation context when resolving enCode to executable expressions */
export type EvaluateContext = {
  tables: TableSource[];
  currentTableId: string;
  currentRow?: SampleRow;
  currentRowId?: string | number;
};

export type SyntaxPreset = 'mustache' | 'custom';

export type EditorSyntax = {
  preset?: SyntaxPreset;
  field: {
    trigger: string;
    close?: string;
  };
  function: {
    trigger: string;
    bareLetter: boolean;
  };
};

export type LocaleMessages = {
  placeholder: string;
  confirm: string;
  editFormulaTab: string;
  fieldsTab: string;
  fieldsSection: string;
  tablesSection: string;
  /** Badge for the current editing table in the hint list */
  currentTableBadge: string;
  functionsTab: string;
  syntax: string;
  description: string;
  example: string;
  detailTitle: string;
  tabHint: string;
  noMatch: string;
  noMatchQuery: string;
  matchCount: string;
  fieldType: string;
  functionType: string;
  defaultFieldHint: string;
  defaultFieldDescription: string;
  defaultTableDescription: string;
  fieldInTableDescription: string;
  functionFallback: string;
  fieldCategoryDefault: string;
  expandEditor: string;
  previewEmpty: string;
};

/** CSS variable theme overrides on the editor root */
export type EditTheme = {
  '--fel-primary'?: string;
  '--fel-primary-hover'?: string;
  '--fel-border'?: string;
  '--fel-bg'?: string;
  '--fel-text'?: string;
  '--fel-muted'?: string;
  '--fel-field-bg'?: string;
  '--fel-field-border'?: string;
  '--fel-field-color'?: string;
  '--fel-field-active-bg'?: string;
  '--fel-field-active-color'?: string;
  '--fel-hint-active-bg'?: string;
  '--fel-match-bg'?: string;
  '--fel-radius'?: string;
  '--fel-font-mono'?: string;
};

/** Per-region className overrides */
export type EditClassNames = {
  root?: string;
  editor?: string;
  editorInput?: string;
  highlight?: string;
  textarea?: string;
  fieldToken?: string;
  functionToken?: string;
  toolbar?: string;
  equal?: string;
  confirm?: string;
  hintPanel?: string;
  hintTabs?: string;
  hintTab?: string;
  hintTabActive?: string;
  hintList?: string;
  hintItem?: string;
  hintItemActive?: string;
  hintDetail?: string;
  hintTrigger?: string;
  preview?: string;
  expand?: string;
  footer?: string;
};

export type CellPopupClassNames = EditClassNames & {
  popup?: string;
  backdrop?: string;
};

export type AnchorRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type ExpressionSegment =
  | { type: 'text'; value: string; start: number; end: number }
  | { type: 'field'; value: string; name: string; start: number; end: number }
  | { type: 'table'; value: string; name: string; start: number; end: number }
  | { type: 'function'; value: string; name: string; start: number; end: number };
