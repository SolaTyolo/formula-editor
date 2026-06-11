import { useEffect, useMemo, useState } from 'react';
import { filterHintItems } from '../hintUtils';
import type { FieldItem, HintCategory, MethodItem } from '../types';
import './HintPanel.css';

type HintItem = FieldItem | MethodItem;

type Props = {
  categories: HintCategory[];
  activeCategoryKey: string;
  onCategoryChange: (key: string) => void;
  onInsert: (item: HintItem, insertType: 'field' | 'function') => void;
  filterQuery?: string;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  triggerActive?: boolean;
  triggerType?: 'field' | 'function' | null;
};

type ListRow =
  | { kind: 'header'; label: string; key: string }
  | { kind: 'item'; item: HintItem; index: number; key: string };

function isMethodItem(item: HintItem): item is MethodItem {
  return 'realValue' in item;
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
        <mark className="hint-item__match">{name.slice(cnIndex, cnIndex + query.length)}</mark>
        {name.slice(cnIndex + query.length)}{suffix}
      </>
    );
  }

  return (
    <>
      {name.slice(0, index)}
      <mark className="hint-item__match">{name.slice(index, index + query.length)}</mark>
      {name.slice(index + query.length)}{suffix}
    </>
  );
}

function buildListRows(
  items: HintItem[],
  filterQuery: string,
  insertType: 'field' | 'function',
): ListRow[] {
  if (insertType === 'field' || filterQuery) {
    return items.map((item, index) => ({
      kind: 'item' as const,
      item,
      index,
      key: `${item.name}-${index}`,
    }));
  }

  const groups = new Map<string, MethodItem[]>();
  (items as MethodItem[]).forEach((item) => {
    const label = item.category ?? '函数';
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(item);
  });

  const rows: ListRow[] = [];
  let index = 0;
  groups.forEach((groupItems, label) => {
    rows.push({ kind: 'header', label, key: `header-${label}` });
    groupItems.forEach((item) => {
      rows.push({ kind: 'item', item, index, key: `${item.name}-${index}` });
      index += 1;
    });
  });
  return rows;
}

function FunctionDetail({ item }: { item: MethodItem }) {
  return (
    <>
      <h4>{item.name}()</h4>
      {item.syntax ? (
        <div className="hint-panel__section">
          <span className="hint-panel__label">语法</span>
          <code className="hint-panel__code">{item.syntax}</code>
        </div>
      ) : null}
      {item.description ? (
        <div className="hint-panel__section">
          <span className="hint-panel__label">说明</span>
          <p>{item.description}</p>
        </div>
      ) : null}
      {item.example ? (
        <div className="hint-panel__section">
          <span className="hint-panel__label">示例</span>
          <pre className="hint-panel__example">{item.example}</pre>
        </div>
      ) : null}
    </>
  );
}

export function HintPanel({
  categories,
  activeCategoryKey,
  onCategoryChange,
  onInsert,
  filterQuery = '',
  activeIndex: controlledIndex,
  onActiveIndexChange,
  triggerActive = false,
  triggerType = null,
}: Props) {
  const activeCategory = categories.find((c) => c.key === activeCategoryKey) ?? categories[0];
  const allItems = activeCategory?.items ?? [];
  const items = useMemo(
    () => filterHintItems(allItems, filterQuery),
    [allItems, filterQuery],
  );
  const listRows = useMemo(
    () => buildListRows(items, filterQuery, activeCategory?.insertType ?? 'field'),
    [items, filterQuery, activeCategory?.insertType],
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
  }, [activeCategoryKey, filterQuery, items.length, setActiveIndex]);

  const activeItem = items[activeIndex];

  useEffect(() => {
    if (triggerActive) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeCategory) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Tab' && activeItem) {
        e.preventDefault();
        onInsert(activeItem, activeCategory.insertType);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeCategory, activeItem, items.length, onInsert, setActiveIndex, triggerActive]);

  const triggerLabel =
    triggerType === 'field' ? `@${filterQuery || '…'}` : filterQuery || '…';

  return (
    <div className="hint-panel">
      <div className="hint-panel__tabs">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className={cat.key === activeCategoryKey ? 'active' : ''}
            onClick={() => onCategoryChange(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="hint-panel__body">
        <ul className="hint-panel__list">
          {items.length === 0 ? (
            <li className="hint-panel__empty">无匹配项</li>
          ) : (
            listRows.map((row) => {
              if (row.kind === 'header') {
                return (
                  <li key={row.key} className="hint-panel__group-title">
                    {row.label}
                  </li>
                );
              }

              const { item, index } = row;
              return (
                <li key={row.key}>
                  <button
                    type="button"
                    className={index === activeIndex ? 'active' : ''}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => onInsert(item, activeCategory.insertType)}
                  >
                    <span className="hint-item__name">
                      <HintItemName
                        name={item.name}
                        query={filterQuery}
                        suffix={activeCategory.insertType === 'function' ? '()' : ''}
                      />
                    </span>
                    {'tag' in item && item.tag ? (
                      <span className="hint-item__tag">{item.tag}</span>
                    ) : null}
                    {index === activeIndex ? <span className="hint-item__tab">Tab</span> : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="hint-panel__detail">
          {triggerActive ? (
            <p className="hint-panel__trigger-hint">{triggerLabel}</p>
          ) : null}
          {activeItem && isMethodItem(activeItem) ? (
            <FunctionDetail item={activeItem} />
          ) : (
            <>
              <h4>{activeItem?.name ?? '说明'}</h4>
              <p>
                {triggerActive && filterQuery
                  ? `输入「${filterQuery}」匹配 ${items.length} 项，↑↓ 选择，Tab 补全`
                  : activeItem?.description ??
                    '输入 @ 引用字段，直接输入字母引用函数；↑↓ 选择，Tab 插入'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
