import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { AnchorRect, CellPopupClassNames } from '../../types';
import { EditLark, type EditLarkProps } from '../editor/Editor';
import { cn } from '../cn';
import { popupBackdropClasses, popupClasses, rootPopupClasses } from '../classes';

export type CellPopupProps = Omit<EditLarkProps, 'mode' | 'classNames'> & {
  open: boolean;
  anchorRect: AnchorRect | null;
  previewResult?: string | number | null;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onClose?: () => void;
  minWidth?: number;
  classNames?: CellPopupClassNames;
};

export function CellPopup({
  open,
  anchorRect,
  previewResult,
  expanded = false,
  onExpandedChange,
  onClose,
  minWidth,
  classNames,
  onConfirm,
  ...editorProps
}: CellPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popupRef.current?.contains(target)) return;
      onClose?.();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const popupStyle = useMemo((): CSSProperties | undefined => {
    if (!anchorRect) return undefined;
    const width = Math.max(minWidth ?? 0, anchorRect.width, 420);
    return {
      top: anchorRect.top + anchorRect.height + 4,
      left: anchorRect.left,
      minWidth: width,
      maxWidth: `min(${width}px, calc(100vw - 16px))`,
    };
  }, [anchorRect, minWidth]);

  if (!open || !anchorRect || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div className={cn(popupBackdropClasses, classNames?.backdrop)} aria-hidden />
      <div
        ref={popupRef}
        className={cn(popupClasses, expanded && 'is-expanded', classNames?.popup)}
        style={popupStyle}
        role="dialog"
        aria-modal="true"
      >
        <EditLark
          {...editorProps}
          mode="cell"
          previewResult={previewResult}
          showExpand={Boolean(onExpandedChange)}
          onExpandClick={() => onExpandedChange?.(!expanded)}
          classNames={{
            ...classNames,
            root: cn(rootPopupClasses, classNames?.root),
          }}
          onConfirm={(enCode, payload) => {
            onConfirm?.(enCode, payload);
            onClose?.();
          }}
        />
      </div>
    </>,
    document.body,
  );
}
