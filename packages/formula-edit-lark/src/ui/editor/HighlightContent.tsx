import { useMemo, type ReactNode } from 'react';
import { getFieldLabel, getFieldTokenName, shouldShowTableInPill } from '../../core/field-display';
import { splitEditorPillDisplay } from './pill-display';
import type { FieldIconRenderer, TableIconRenderer } from '../icons/FieldTypeIcon';
import { parseSegments } from '../../core/segments';
import type {
  EditorSyntax,
  FieldItem,
  EditClassNames,
  MethodItem,
  TableRefItem,
} from '../../types';
import { cn } from '../cn';
import {
  fieldPillDisplayClasses,
  fieldPillQualifiedClasses,
  fieldPillTableClasses,
  placeholderClasses,
  tokenPartClasses,
  tokenPillClasses,
  tokenPillHiddenClasses,
  tokenSepClasses,
  tokenSizerClasses,
  tokenTextClasses,
  tokenWrapClasses,
} from '../classes';

function EditorPillLabel({
  displayValue,
  syntax,
  kind,
}: {
  displayValue: string;
  syntax: EditorSyntax;
  kind: 'field' | 'table';
}) {
  const { prefix, label, suffix } = splitEditorPillDisplay(displayValue, syntax, kind);
  return (
    <>
      {prefix ? (
        <span className={tokenPillHiddenClasses} aria-hidden="true">
          {prefix}
        </span>
      ) : null}
      {label ? <span className={tokenTextClasses}>{label}</span> : null}
      {suffix ? (
        <span className={tokenPillHiddenClasses} aria-hidden="true">
          {suffix}
        </span>
      ) : null}
    </>
  );
}

function TableTokenPill({
  name,
  displayValue,
  layout,
  syntax,
}: {
  name: string;
  displayValue: string;
  layout: 'editor' | 'display';
  syntax: EditorSyntax;
}) {
  if (layout === 'editor') {
    return <EditorPillLabel displayValue={displayValue} syntax={syntax} kind="table" />;
  }
  return <span className={tokenTextClasses}>{name}</span>;
}

function FieldTokenPill({
  field,
  displayValue,
  layout,
  syntax,
}: {
  field: FieldItem;
  displayValue: string;
  layout: 'editor' | 'display';
  syntax: EditorSyntax;
}) {
  if (layout === 'editor') {
    return <EditorPillLabel displayValue={displayValue} syntax={syntax} kind="field" />;
  }

  if (!shouldShowTableInPill(field)) {
    return <span className={tokenTextClasses}>{getFieldLabel(field)}</span>;
  }

  return (
    <>
      <span className={tokenPartClasses}>
        <span className={tokenTextClasses}>{field.tableName}</span>
      </span>
      <span className={tokenSepClasses}>.</span>
      <span className={tokenPartClasses}>
        <span className={tokenTextClasses}>{field.columnTitle}</span>
      </span>
    </>
  );
}

function TokenPillWrapper({
  value,
  className,
  dataType,
  children,
}: {
  value: string;
  className?: string;
  dataType?: string;
  children: ReactNode;
}) {
  return (
    <span className={tokenWrapClasses}>
      <span className={tokenSizerClasses} aria-hidden="true">
        {value}
      </span>
      <span className={cn(tokenPillClasses, className)} data-type={dataType}>
        {children}
      </span>
    </span>
  );
}

export type HighlightContentProps = {
  value: string;
  placeholder?: string;
  fieldList: FieldItem[];
  methodList: MethodItem[];
  tableRefList?: TableRefItem[];
  syntax: EditorSyntax;
  classNames?: EditClassNames;
  /** Reserved for a future pill icon API */
  renderFieldIcon?: FieldIconRenderer;
  renderTableIcon?: TableIconRenderer;
  pillLayout?: 'editor' | 'display';
};

export function HighlightContent({
  value,
  placeholder,
  fieldList,
  methodList,
  tableRefList = [],
  syntax,
  classNames,
  pillLayout = 'editor',
}: HighlightContentProps) {
  const fieldByToken = useMemo(() => {
    const map = new Map<string, FieldItem>();
    fieldList.forEach((field) => map.set(getFieldTokenName(field), field));
    return map;
  }, [fieldList]);

  const tableNames = useMemo(() => tableRefList.map((t) => t.name), [tableRefList]);

  const segments = useMemo(
    () => parseSegments(value, fieldList, methodList, syntax, tableNames),
    [value, fieldList, methodList, syntax, tableNames],
  );

  return (
    <>
      {value ? (
        segments.map((seg, i) => {
          if (seg.type === 'field') {
            const field = fieldByToken.get(seg.name);
            if (!field) {
              return <span key={`${seg.start}-${i}`}>{seg.value}</span>;
            }
            const useEditorPill = pillLayout === 'editor';
            const pillBody = (
              <FieldTokenPill
                field={field}
                displayValue={seg.value}
                layout={pillLayout}
                syntax={syntax}
              />
            );
            if (!useEditorPill) {
              return (
                <span
                  key={`${seg.start}-${i}`}
                  className={cn(
                    fieldPillDisplayClasses,
                    shouldShowTableInPill(field) && fieldPillQualifiedClasses,
                    classNames?.fieldToken,
                  )}
                  data-type={field.type}
                >
                  {pillBody}
                </span>
              );
            }
            return (
              <TokenPillWrapper
                key={`${seg.start}-${i}`}
                value={seg.value}
                dataType={field.type}
                className={classNames?.fieldToken}
              >
                {pillBody}
              </TokenPillWrapper>
            );
          }
          if (seg.type === 'table') {
            const useEditorPill = pillLayout === 'editor';
            const pillBody = (
              <TableTokenPill
                name={seg.name}
                displayValue={seg.value}
                layout={pillLayout}
                syntax={syntax}
              />
            );
            if (!useEditorPill) {
              return (
                <span
                  key={`${seg.start}-${i}`}
                  className={cn(fieldPillDisplayClasses, fieldPillTableClasses, classNames?.fieldToken)}
                >
                  {pillBody}
                </span>
              );
            }
            return (
              <TokenPillWrapper key={`${seg.start}-${i}`} value={seg.value} className={classNames?.fieldToken}>
                {pillBody}
              </TokenPillWrapper>
            );
          }
          if (seg.type === 'function') {
            return <span key={`${seg.start}-${i}`}>{seg.value}</span>;
          }
          return <span key={`${seg.start}-${i}`}>{seg.value}</span>;
        })
      ) : (
        <span className={placeholderClasses}>{placeholder}</span>
      )}
    </>
  );
}
