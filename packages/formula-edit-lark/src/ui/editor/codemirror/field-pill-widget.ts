import { WidgetType } from '@codemirror/view';

export class FieldPillWidget extends WidgetType {
  constructor(
    readonly label: string,
    readonly dataType?: string,
    readonly active = false,
  ) {
    super();
  }

  eq(other: FieldPillWidget) {
    return (
      other.label === this.label &&
      other.dataType === this.dataType &&
      other.active === this.active
    );
  }

  toDOM() {
    const span = document.createElement('span');
    span.className = this.active ? 'fel-cm-pill fel-cm-pill-active' : 'fel-cm-pill';
    span.textContent = this.label;
    if (this.dataType) span.dataset.type = this.dataType;
    return span;
  }

  ignoreEvent() {
    return false;
  }
}
