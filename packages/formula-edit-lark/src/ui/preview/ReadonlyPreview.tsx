import { useMemo } from 'react';
import { enCodeToCn } from '../../core/codec';
import { resolveSyntax, type SyntaxPresetName } from '../../core/syntax';
import { tablesToTableRefList } from '../../core/tables';
import type { EditorSyntax, FieldItem, EditClassNames, MethodItem, TableSource } from '../../types';
import type { FieldIconRenderer, TableIconRenderer } from '../icons/FieldTypeIcon';
import { cn } from '../cn';
import { readonlyClasses } from '../classes';
import { HighlightContent } from '../editor/HighlightContent';

export type ReadonlyPreviewProps = {
  value: string;
  fieldList: FieldItem[];
  methodList: MethodItem[];
  tables?: TableSource[];
  syntax: EditorSyntax | SyntaxPresetName;
  className?: string;
  classNames?: EditClassNames;
  renderFieldIcon?: FieldIconRenderer;
  renderTableIcon?: TableIconRenderer;
};

export function ReadonlyPreview({
  value,
  fieldList,
  methodList,
  tables,
  syntax,
  className,
  classNames,
  renderFieldIcon,
  renderTableIcon,
}: ReadonlyPreviewProps) {
  const tableRefList = useMemo(() => tablesToTableRefList(tables ?? []), [tables]);
  const resolvedSyntax = useMemo(() => resolveSyntax(syntax), [syntax]);
  const cnCode = useMemo(
    () => enCodeToCn(value, fieldList, methodList, resolvedSyntax, tableRefList),
    [value, fieldList, methodList, resolvedSyntax, tableRefList],
  );

  return (
    <div className={cn(readonlyClasses, className)}>
      <HighlightContent
        value={cnCode}
        fieldList={fieldList}
        methodList={methodList}
        tableRefList={tableRefList}
        syntax={resolvedSyntax}
        classNames={classNames}
        renderFieldIcon={renderFieldIcon}
        renderTableIcon={renderTableIcon}
        pillLayout="display"
      />
    </div>
  );
}
