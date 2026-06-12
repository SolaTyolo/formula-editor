import { useEffect, useMemo, useState } from 'react';
import { getFieldLabel } from '../../core/field-display';
import { formatFieldTriggerLabel, formatFunctionTriggerLabel } from '../../core/syntax';
import { filterHintItems } from '../../core/hint/utils';
import { formatMessage } from '../../i18n';
import type {
  EditorSyntax,
  FieldItem,
  EditClassNames,
  HintListSection,
  LocaleMessages,
  MethodItem,
  TableRefItem,
} from '../../types';
import {
  FieldTypeIcon,
  resolveFieldIconType,
  type FieldIconRenderer,
  type TableIconRenderer,
} from '../icons/FieldTypeIcon';
import { cn } from '../cn';
import {
  hintBodyClasses,
  hintCodeClasses,
  hintDetailClasses,
  hintDetailTextClasses,
  hintDetailTitleClasses,
  hintEmptyClasses,
  hintGroupTitleClasses,
  hintHeaderClasses,
  hintItemActiveClasses,
  hintItemButtonClasses,
  hintItemNameClasses,
  hintItemTabClasses,
  hintItemCurrentBadgeClasses,
  hintItemMetaClasses,
  hintItemTableNameClasses,
  hintLabelClasses,
  hintListClasses,
  hintMatchClasses,
  hintPanelClasses,
  hintSectionClasses,
  hintTableRefClasses,
  hintTitleClasses,
  hintTriggerClasses,
} from './classes';

type HintItem = FieldItem | MethodItem | TableRefItem;

type Props = {
  title: string;
  sections: HintListSection[];
  onInsert: (item: HintItem, insertType: 'field' | 'function' | 'table') => void;
  fieldFilterQuery?: string;
  tableFilterQuery?: string;
  functionFilterQuery?: string;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  triggerActive?: boolean;
  triggerType?: 'field' | 'function' | null;
  syntax: EditorSyntax;
  messages: LocaleMessages;
  currentTableId?: string;
  classNames?: EditClassNames;
  renderFieldIcon?: FieldIconRenderer;
  renderTableIcon?: TableIconRenderer;
};

type ListRow =
  | { kind: 'header'; label: string; key: string }
  | { kind: 'item'; item: HintItem; index: number; insertType: 'field' | 'function' | 'table'; key: string };

function isMethodItem(item: HintItem): item is MethodItem {
  return 'realValue' in item;
}

function isTableRefItem(item: HintItem): item is TableRefItem {
  return 'id' in item && !('realValue' in item) && !('value' in item);
}

function isFieldItem(item: HintItem): item is FieldItem {
  return 'value' in item;
}

function HintItemName({
  name,
  query,
  suffix = '',
}: {
  name: string;
  query: string;
  suffix?: string;
}) {
  if (!query) return <>{name}{suffix}</>;

  const index = name.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) {
    const cnIndex = name.indexOf(query);
    if (cnIndex === -1) return <>{name}{suffix}</>;
    return (
      <>
        {name.slice(0, cnIndex)}
        <mark className={hintMatchClasses}>{name.slice(cnIndex, cnIndex + query.length)}</mark>
        {name.slice(cnIndex + query.length)}{suffix}
      </>
    );
  }

  return (
    <>
      {name.slice(0, index)}
      <mark className={hintMatchClasses}>{name.slice(index, index + query.length)}</mark>
      {name.slice(index + query.length)}{suffix}
    </>
  );
}

function buildSectionRows(
  sections: HintListSection[],
  fieldQuery: string,
  tableQuery: string,
  functionQuery: string,
): ListRow[] {
  const rows: ListRow[] = [];
  let index = 0;

  sections.forEach((section) => {
    const query =
      section.insertType === 'table'
        ? tableQuery
        : section.insertType === 'function'
          ? functionQuery
          : fieldQuery;
    const items = filterHintItems(section.items as Array<{ name: string; label?: string }>, query);
    if (items.length === 0) return;

    rows.push({ kind: 'header', label: section.label, key: `section-${section.key}` });
    items.forEach((item) => {
      rows.push({
        kind: 'item',
        item: item as HintItem,
        index,
        insertType: section.insertType,
        key: `${section.key}-${getItemKey(item as HintItem)}-${index}`,
      });
      index += 1;
    });
  });

  return rows;
}

function getItemKey(item: HintItem): string {
  if (isTableRefItem(item)) return item.id;
  if (isFieldItem(item)) return item.value;
  return item.name;
}

function getDisplayName(item: HintItem): string {
  if (isFieldItem(item)) return getFieldLabel(item);
  return item.name;
}

function FunctionDetail({ item, messages }: { item: MethodItem; messages: LocaleMessages }) {
  return (
    <>
      <h4 className={hintDetailTitleClasses}>{item.name}()</h4>
      {item.syntax ? (
        <div className={hintSectionClasses}>
          <span className={hintLabelClasses}>{messages.syntax}</span>
          <code className={hintCodeClasses}>{item.syntax}</code>
        </div>
      ) : null}
      {item.description ? (
        <div className={hintSectionClasses}>
          <span className={hintLabelClasses}>{messages.description}</span>
          <p className={hintDetailTextClasses}>{item.description}</p>
        </div>
      ) : null}
      {item.example ? (
        <div className={hintSectionClasses}>
          <span className={hintLabelClasses}>{messages.example}</span>
          <pre className={hintCodeClasses}>{item.example}</pre>
        </div>
      ) : null}
    </>
  );
}

function FieldDetail({
  item,
  messages,
  syntax,
}: {
  item: FieldItem;
  messages: LocaleMessages;
  syntax: EditorSyntax;
}) {
  const fieldTrigger = formatFieldTriggerLabel(syntax, '');
  const title =
    item.tableName && item.columnTitle
      ? `${item.tableName}.${item.columnTitle}`
      : getFieldLabel(item);
  const description =
    item.description ??
    (item.tableName
      ? formatMessage(messages.fieldInTableDescription, { table: item.tableName })
      : formatMessage(messages.defaultFieldHint, { trigger: fieldTrigger }));

  return (
    <>
      <h4 className={hintDetailTitleClasses}>{title}</h4>
      {item.tableName ? (
        <p className={hintTableRefClasses}>
          <FieldTypeIcon iconType="table" context="hint" />
          {item.tableName}
        </p>
      ) : null}
      <p className={hintDetailTextClasses}>{description}</p>
    </>
  );
}

function TableDetail({ item, messages }: { item: TableRefItem; messages: LocaleMessages }) {
  return (
    <>
      <h4 className={hintDetailTitleClasses}>{item.name}</h4>
      <p className={hintDetailTextClasses}>{item.description ?? messages.defaultTableDescription}</p>
    </>
  );
}

function HintItemLeadingIcon({
  item,
  insertType,
  renderFieldIcon,
  renderTableIcon,
}: {
  item: HintItem;
  insertType: 'field' | 'function' | 'table';
  renderFieldIcon?: FieldIconRenderer;
  renderTableIcon?: TableIconRenderer;
}) {
  if (insertType === 'table' && isTableRefItem(item)) {
    const custom = renderTableIcon?.(item, 'hint');
    if (custom) return <>{custom}</>;
    return <FieldTypeIcon iconType={item.iconType ?? 'table'} context="hint" />;
  }

  if (isFieldItem(item)) {
    const custom = renderFieldIcon?.(item, 'hint');
    if (custom) return <>{custom}</>;
    return <FieldTypeIcon iconType={resolveFieldIconType(item)} context="hint" />;
  }

  return null;
}

export function HintPanel({
  title,
  sections,
  onInsert,
  fieldFilterQuery = '',
  tableFilterQuery = '',
  functionFilterQuery = '',
  activeIndex: controlledIndex,
  onActiveIndexChange,
  triggerActive = false,
  triggerType = null,
  syntax,
  messages,
  currentTableId,
  classNames,
  renderFieldIcon,
  renderTableIcon,
}: Props) {
  const listRows = useMemo(
    () => buildSectionRows(sections, fieldFilterQuery, tableFilterQuery, functionFilterQuery),
    [sections, fieldFilterQuery, tableFilterQuery, functionFilterQuery],
  );

  const selectableItems = useMemo(
    () => listRows.filter((row): row is Extract<ListRow, { kind: 'item' }> => row.kind === 'item'),
    [listRows],
  );

  const [internalIndex, setInternalIndex] = useState(0);
  const isControlled = controlledIndex !== undefined;
  const activeIndex = isControlled ? controlledIndex : internalIndex;

  const setActiveIndex = (next: number | ((prev: number) => number)) => {
    if (isControlled) {
      const value = typeof next === 'function' ? next(activeIndex) : next;
      onActiveIndexChange?.(value);
    } else {
      setInternalIndex(next);
    }
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [fieldFilterQuery, tableFilterQuery, functionFilterQuery, selectableItems.length, sections]);

  const activeItem = selectableItems[activeIndex]?.item;

  const triggerLabel =
    triggerType === 'field'
      ? formatFieldTriggerLabel(syntax, fieldFilterQuery)
      : formatFunctionTriggerLabel(syntax, functionFilterQuery);

  const fieldTriggerHint = formatFieldTriggerLabel(syntax, syntax.field.trigger);

  return (
    <div className={cn(hintPanelClasses, classNames?.hintPanel)}>
      <div className={cn(hintHeaderClasses, classNames?.hintTabs)}>
        <span className={cn(hintTitleClasses, classNames?.hintTab, classNames?.hintTabActive)}>
          {title}
        </span>
      </div>

      <div className={hintBodyClasses}>
        <ul className={cn(hintListClasses, classNames?.hintList)}>
          {selectableItems.length === 0 ? (
            <li className={hintEmptyClasses}>{messages.noMatch}</li>
          ) : (
            listRows.map((row) => {
              if (row.kind === 'header') {
                return (
                  <li key={row.key} className={hintGroupTitleClasses}>
                    {row.label}
                  </li>
                );
              }

              const { item, index, insertType } = row;
              const displayName = getDisplayName(item);
              const query =
                insertType === 'table'
                  ? tableFilterQuery
                  : insertType === 'function'
                    ? functionFilterQuery
                    : fieldFilterQuery;

              return (
                <li key={row.key}>
                  <button
                    type="button"
                    className={cn(
                      hintItemButtonClasses,
                      classNames?.hintItem,
                      index === activeIndex && hintItemActiveClasses,
                      index === activeIndex && classNames?.hintItemActive,
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => onInsert(item, insertType)}
                  >
                    <HintItemLeadingIcon
                      item={item}
                      insertType={insertType}
                      renderFieldIcon={renderFieldIcon}
                      renderTableIcon={renderTableIcon}
                    />
                    <span
                      className={cn(
                        hintItemNameClasses,
                        isTableRefItem(item) && hintItemTableNameClasses,
                      )}
                    >
                      <HintItemName
                        name={displayName}
                        query={query}
                        suffix={insertType === 'function' ? '()' : ''}
                      />
                    </span>
                    {(() => {
                      const showCurrentBadge =
                        insertType === 'table' &&
                        isTableRefItem(item) &&
                        currentTableId &&
                        item.id === currentTableId;
                      const showTab = index === activeIndex;
                      if (!showCurrentBadge && !showTab) return null;
                      return (
                        <span className={hintItemMetaClasses}>
                          {showCurrentBadge ? (
                            <span className={hintItemCurrentBadgeClasses}>
                              {messages.currentTableBadge}
                            </span>
                          ) : null}
                          {showTab ? (
                            <span className={hintItemTabClasses}>{messages.tabHint}</span>
                          ) : null}
                        </span>
                      );
                    })()}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className={cn(hintDetailClasses, classNames?.hintDetail)}>
          {triggerActive ? (
            <p className={cn(hintTriggerClasses, classNames?.hintTrigger)}>{triggerLabel}</p>
          ) : null}
          {activeItem && isMethodItem(activeItem) ? (
            <FunctionDetail item={activeItem} messages={messages} />
          ) : activeItem && isFieldItem(activeItem) ? (
            <FieldDetail item={activeItem} messages={messages} syntax={syntax} />
          ) : activeItem && isTableRefItem(activeItem) ? (
            <TableDetail item={activeItem} messages={messages} />
          ) : (
            <>
              <h4 className={hintDetailTitleClasses}>{messages.detailTitle}</h4>
              <p className={hintDetailTextClasses}>
                {formatMessage(messages.defaultFieldHint, { trigger: fieldTriggerHint })}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
