import type { EditorSyntax, FieldItem, MethodItem } from '../../../types';

export type FormulaEditorContext = {
  fieldList: FieldItem[];
  methodList: MethodItem[];
  syntax: EditorSyntax;
  tableNames: string[];
  highlight: boolean;
};
