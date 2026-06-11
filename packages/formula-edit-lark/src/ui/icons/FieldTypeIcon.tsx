import type { ReactNode } from 'react';
import type { FieldIconType, FieldItem, TableRefItem } from '../../types';
import { cn } from '../cn';

export type FieldIconRenderContext = 'pill' | 'hint';

export type FieldIconRenderer = (
  field: FieldItem,
  context: FieldIconRenderContext,
) => ReactNode;

export type TableIconRenderer = (
  table: TableRefItem,
  context: FieldIconRenderContext,
) => ReactNode;

const MUTED = '#646a73';

type IconTone = 'muted' | 'pill';

function toneColor(tone: IconTone) {
  return tone === 'pill' ? 'var(--fel-field-color, #2e7d32)' : MUTED;
}

function iconSize(context: FieldIconRenderContext) {
  return context === 'hint' ? 'size-4' : 'size-3.5';
}

/** Infer icon type from field type label when iconType is omitted */
export function inferFieldIconType(type?: string): FieldIconType {
  if (!type) return 'text';
  const lower = type.toLowerCase();
  if (
    type.includes('公式') ||
    lower.includes('formula') ||
    lower.includes('computed') ||
    lower.includes('calc')
  ) {
    return 'formula';
  }
  if (type.includes('日') || lower.includes('date') || lower.includes('time')) return 'date';
  if (
    type.includes('单选') ||
    type.includes('多选') ||
    type.includes('选择') ||
    lower.includes('select') ||
    lower.includes('choice') ||
    lower.includes('enum') ||
    lower.includes('option')
  ) {
    return 'select';
  }
  if (
    type.includes('数') ||
    lower.includes('number') ||
    lower.includes('num') ||
    lower.includes('currency') ||
    lower.includes('amount')
  ) {
    return 'number';
  }
  if (lower.includes('bool') || type.includes('布尔') || type.includes('复选')) return 'checkbox';
  if (lower.includes('user') || type.includes('人员') || type.includes('用户')) return 'user';
  if (lower.includes('attach') || type.includes('附件')) return 'attachment';
  return 'text';
}

export function resolveFieldIconType(field: FieldItem): FieldIconType {
  return field.iconType ?? inferFieldIconType(field.type);
}

type FieldTypeIconProps = {
  iconType: FieldIconType;
  context?: FieldIconRenderContext;
  className?: string;
};

export function FieldTypeIcon({
  iconType,
  context = 'pill',
  className,
}: FieldTypeIconProps) {
  const tone: IconTone = context === 'pill' ? 'pill' : 'muted';
  const color = toneColor(tone);
  const sizeClass = iconSize(context);

  return (
    <span
      className={cn('inline-block shrink-0 align-[-2px]', sizeClass, className)}
      aria-hidden
    >
      {renderSvg(iconType, color)}
    </span>
  );
}

function renderSvg(iconType: FieldIconType, color: string) {
  switch (iconType) {
    case 'number':
      return (
        <svg viewBox="0 0 16 16" className="size-full">
          <text x="3" y="12" fontSize="11" fontWeight="600" fill={color} fontFamily="-apple-system,BlinkMacSystemFont,sans-serif">
            #
          </text>
        </svg>
      );
    case 'date':
      return (
        <svg viewBox="0 0 16 16" className="size-full" fill="none" stroke={color} strokeWidth="1.2">
          <rect x="2.5" y="3.5" width="11" height="10" rx="1" />
          <path d="M2.5 6.5h11M5.5 2v2M10.5 2v2" />
        </svg>
      );
    case 'select':
      return (
        <svg viewBox="0 0 16 16" className="size-full" fill="none" stroke={color} strokeWidth="1.2">
          <circle cx="8" cy="8" r="5.5" />
          <path d="M6 7l2 2 2-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'formula':
      return (
        <svg viewBox="0 0 16 16" className="size-full">
          <text x="2" y="12" fontSize="10" fontStyle="italic" fontWeight="600" fill={color} fontFamily="Georgia,serif">
            fx
          </text>
        </svg>
      );
    case 'checkbox':
      return (
        <svg viewBox="0 0 16 16" className="size-full" fill="none" stroke={color} strokeWidth="1.2">
          <rect x="3" y="3" width="10" height="10" rx="1.5" />
          <path d="M5.5 8l1.8 1.8L10.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'user':
      return (
        <svg viewBox="0 0 16 16" className="size-full" fill={color}>
          <path d="M8 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-4.5 5.5a4.5 4.5 0 019 0H3.5z" />
        </svg>
      );
    case 'attachment':
      return (
        <svg viewBox="0 0 16 16" className="size-full" fill="none" stroke={color} strokeWidth="1.2">
          <path
            d="M9.5 3.5l3 3-5.8 5.8a2.5 2.5 0 01-3.5-3.5l6.5-6.5a1.5 1.5 0 012.1 2.1L6.8 11.4"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'table':
      return (
        <svg viewBox="0 0 16 16" className="size-full" fill={color}>
          <path d="M2 3h12v10H2V3zm1 1v2h4V4H3zm5 0v2h4V4H8zM3 7v2h4V7H3zm5 0v2h4V7H8zM3 10v2h4v-2H3zm5 0v2h4v-2H8z" />
        </svg>
      );
    case 'text':
    default:
      return (
        <svg viewBox="0 0 16 16" className="size-full">
          <text x="1" y="12" fontSize="10" fontWeight="600" fill={color} fontFamily="-apple-system,BlinkMacSystemFont,sans-serif">
            A=
          </text>
        </svg>
      );
  }
}
