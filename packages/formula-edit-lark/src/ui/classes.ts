/** Shared Tailwind class groups for formula editor UI */

export const rootClasses =
  'overflow-hidden rounded-lg border border-[var(--fel-border,#d0d3d6)] bg-[var(--fel-bg,#fff)] shadow-[0_4px_16px_rgba(31,35,41,0.08)]';

export const rootCellClasses = 'border-none shadow-none';

export const editorClasses = 'px-3 pt-3';

export const editorCellClasses = 'pb-1';

export const inputWrapClasses = 'relative w-full min-h-24';

export const inputWrapCellClasses = 'min-h-14';

export const inputLayerClasses =
  'box-border m-0 w-full min-h-24 resize-y border-none p-0 text-sm leading-[1.7] font-mono whitespace-pre-wrap break-words outline-none';

export const highlightClasses =
  'pointer-events-none absolute inset-0 overflow-hidden text-[var(--fel-text,#1f2329)]';

export const textareaClasses =
  'relative z-[1] bg-transparent text-transparent caret-[var(--fel-text,#1f2329)]';

export const textareaPlainClasses =
  'bg-[var(--fel-bg,#fff)] text-[var(--fel-text,#1f2329)]';

export const placeholderClasses = 'text-[#bbbfc4]';

export const fieldPillDisplayClasses =
  'mx-px inline-flex items-center gap-0.5 rounded border border-[var(--fel-field-border,#81c784)] bg-[var(--fel-field-bg,#e8f5e9)] px-1.5 py-0 font-medium leading-[inherit] text-[var(--fel-field-color,#2e7d32)] [box-decoration-break:clone]';

export const fieldPillQualifiedClasses = 'flex-nowrap';

export const fieldPillTableClasses = '';

export const tokenWrapClasses = 'relative inline-block align-baseline leading-[inherit]';

export const tokenSizerClasses =
  'invisible whitespace-pre font-[inherit] leading-[inherit]';

/** Inset ring avoids border box shrinking text vs textarea (caret alignment) */
export const tokenPillClasses =
  'absolute inset-0 flex items-center overflow-hidden whitespace-nowrap rounded bg-[var(--fel-field-bg,#e8f5e9)] px-0 py-0 font-[inherit] leading-[inherit] text-[var(--fel-field-color,#2e7d32)] shadow-[inset_0_0_0_1px_var(--fel-field-border,#81c784)]';

/** Invisible syntax chars kept for caret alignment (#, {{, }}) */
export const tokenPillHiddenClasses =
  'invisible whitespace-pre font-[inherit] leading-[inherit]';

export const tokenTextClasses = 'inline whitespace-pre leading-[inherit]';

export const tokenPartClasses = 'inline-flex items-center gap-0.5';

export const tokenSepClasses = 'px-px text-[var(--fel-muted,#8f959e)]';

export const toolbarClasses =
  'flex items-center justify-between border-y border-[#e5e6eb] bg-[var(--fel-bg,#fff)] px-3 py-2';

export const equalClasses = 'text-lg font-semibold text-[var(--fel-muted,#8f959e)]';

export const confirmClasses =
  'cursor-pointer rounded-md border-none bg-[var(--fel-primary,#1456f0)] px-4 py-1.5 text-[13px] text-white hover:bg-[var(--fel-primary-hover,#0f47cc)]';

export const previewClasses =
  'flex items-center gap-1.5 border-b border-[#e5e6eb] px-3 pb-2 pt-1 font-mono text-[13px]';

export const previewEqClasses = 'font-semibold text-[var(--fel-muted,#8f959e)]';

export const previewValueClasses =
  'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[var(--fel-text,#1f2329)]';

export const expandClasses =
  'ml-auto inline-flex size-7 cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-0 text-[var(--fel-muted,#8f959e)] hover:bg-[#f2f3f5] hover:text-[var(--fel-text,#1f2329)]';

export const footerClasses =
  'flex justify-end border-t border-[#e5e6eb] bg-[var(--fel-bg,#fff)] px-3 pb-3 pt-2';

export const readonlyClasses =
  'whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.7] text-[var(--fel-text,#1f2329)]';

export const popupBackdropClasses = 'fixed inset-0 z-[9998] bg-transparent';

export const popupClasses = 'fixed z-[9999] box-border';

export const popupExpandedInputClasses = 'min-h-40';

export const hoverPreviewClasses =
  'pointer-events-auto fixed z-[9999] box-border rounded-md border border-[#e5e6eb] bg-white px-3 py-2 shadow-[0_4px_16px_rgba(31,35,41,0.12)]';
