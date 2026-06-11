export type TriggerContext = {
  type: 'field' | 'function';
  query: string;
  start: number;
  end: number;
};

const FIELD_TOKEN_REG = /^[^\s+\-*\/#%(),;!<>=@]*$/;
const FUNC_TOKEN_REG = /^[A-Za-z]*$/;
const FUNC_PREFIX_REG = /[(\s,+\-*\/=<>!&|]/;

function findFieldTrigger(before: string, cursor: number): TriggerContext | null {
  for (let i = cursor - 1; i >= 0; i -= 1) {
    if (before[i] !== '@') continue;
    const query = before.slice(i + 1, cursor);
    if (FIELD_TOKEN_REG.test(query)) {
      return { type: 'field', query, start: i, end: cursor };
    }
    break;
  }
  return null;
}

function findFunctionTrigger(before: string, cursor: number): TriggerContext | null {
  for (let i = cursor - 1; i >= 0; i -= 1) {
    if (before[i] !== '#') continue;
    const query = before.slice(i + 1, cursor);
    if (FUNC_TOKEN_REG.test(query)) {
      return { type: 'function', query, start: i, end: cursor };
    }
    break;
  }

  const match = before.match(/[A-Za-z]+$/);
  if (!match) return null;

  const query = match[0];
  const start = before.length - query.length;
  if (start > 0) {
    const prev = before[start - 1];
    if (/[A-Za-z0-9_@#.]/.test(prev)) return null;
    if (!FUNC_PREFIX_REG.test(prev)) return null;
  }

  return { type: 'function', query, start, end: cursor };
}

/** 检测光标处是否正在输入 @字段 或函数名（含裸字母 A/AND 与 # 前缀） */
export function getTriggerContext(text: string, cursor: number): TriggerContext | null {
  const before = text.slice(0, cursor);
  return findFieldTrigger(before, cursor) ?? findFunctionTrigger(before, cursor);
}

export function filterHintItems<T extends { name: string }>(items: T[], query: string): T[] {
  if (!query) return items;
  const lower = query.toLowerCase();
  return items
    .filter((item) => {
      const nameLower = item.name.toLowerCase();
      return nameLower.startsWith(lower) || nameLower.includes(lower);
    })
    .sort((a, b) => {
      const aLower = a.name.toLowerCase();
      const bLower = b.name.toLowerCase();
      const aStarts = aLower.startsWith(lower) ? 0 : 1;
      const bStarts = bLower.startsWith(lower) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return aLower.localeCompare(bLower);
    });
}

/** 函数模板如 AND(,)、ROUND(,2) 插入后，光标应落在第一个 ( 之后 */
export function getFunctionCursorOffset(text: string): number | null {
  const match = text.match(/^[A-Za-z]+\(/);
  if (!match) return null;
  return match[0].length;
}
