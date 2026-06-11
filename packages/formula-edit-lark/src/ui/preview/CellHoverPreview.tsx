import { useMemo, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { AnchorRect } from '../../types';
import { ReadonlyPreview, type ReadonlyPreviewProps } from './ReadonlyPreview';
import { cn } from '../cn';
import { hoverPreviewClasses } from '../classes';

export type CellHoverPreviewProps = ReadonlyPreviewProps & {
  open: boolean;
  anchorRect: AnchorRect | null;
  classNames?: ReadonlyPreviewProps['classNames'] & {
    popup?: string;
  };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export function CellHoverPreview({
  open,
  anchorRect,
  classNames,
  onMouseEnter,
  onMouseLeave,
  ...previewProps
}: CellHoverPreviewProps) {
  const popupStyle = useMemo((): CSSProperties | undefined => {
    if (!anchorRect) return undefined;
    return {
      top: anchorRect.top + anchorRect.height + 4,
      left: anchorRect.left,
      minWidth: Math.max(anchorRect.width, 200),
      maxWidth: `min(480px, calc(100vw - ${anchorRect.left + 16}px))`,
    };
  }, [anchorRect]);

  if (!open || !anchorRect || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cn(hoverPreviewClasses, classNames?.popup)}
      style={popupStyle}
      role="tooltip"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ReadonlyPreview {...previewProps} />
    </div>,
    document.body,
  );
}
