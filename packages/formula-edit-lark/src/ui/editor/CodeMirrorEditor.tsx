import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { bracketMatching } from '@codemirror/language';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import type {
  EditorSyntax,
  FieldItem,
  EditClassNames,
  MethodItem,
  TableRefItem,
} from '../../types';
import { cn } from '../cn';
import { inputWrapClasses, inputWrapCompactClasses } from '../classes';
import type { FormulaEditorContext } from './codemirror/context';
import { atomicRangesExtension, fieldPillsExtension } from './codemirror/field-pills';
import { createInteractionExtensions, type FormulaEditorInteraction } from './codemirror/interaction';
import { editorRootClassName, formulaEditorTheme } from './codemirror/theme';

export type CodeMirrorEditorHandle = {
  focus: () => void;
  getSelection: () => { from: number; to: number };
  replaceRange: (from: number, to: number, text: string, cursor?: number) => void;
};

type Props = {
  value: string;
  placeholder?: string;
  fieldList: FieldItem[];
  methodList: MethodItem[];
  tableRefList?: TableRefItem[];
  tableNames: string[];
  syntax: EditorSyntax;
  classNames?: EditClassNames;
  compact?: boolean;
  highlight?: boolean;
  onChange: (value: string, cursor: number) => void;
  interactionRef: React.MutableRefObject<FormulaEditorInteraction | null>;
};

export const CodeMirrorEditor = forwardRef<CodeMirrorEditorHandle, Props>(
  function CodeMirrorEditor(
    {
      value,
      placeholder: placeholderText,
      fieldList,
      methodList,
      tableNames,
      syntax,
      classNames,
      compact = false,
      highlight = true,
      onChange,
      interactionRef,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const contextRef = useRef<FormulaEditorContext>({
      fieldList,
      methodList,
      syntax,
      tableNames,
      highlight,
    });
    contextRef.current = { fieldList, methodList, syntax, tableNames, highlight };

    useImperativeHandle(ref, () => ({
      focus: () => viewRef.current?.focus(),
      getSelection: () => {
        const view = viewRef.current;
        if (!view) return { from: 0, to: 0 };
        const main = view.state.selection.main;
        return { from: main.from, to: main.to };
      },
      replaceRange: (from, to, text, cursor) => {
        const view = viewRef.current;
        if (!view) return;
        const pos = cursor ?? from + text.length;
        view.dispatch({
          changes: { from, to, insert: text },
          selection: { anchor: pos },
        });
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const getContext = () => contextRef.current;
      const getInteraction = () => interactionRef.current ?? {};

      const extensions = [
        history(),
        EditorView.lineWrapping,
        bracketMatching(),
        formulaEditorTheme(compact, classNames),
        fieldPillsExtension(getContext),
        atomicRangesExtension(getContext),
        placeholder(placeholderText ?? ''),
        EditorView.updateListener.of((update) => {
          if (update.docChanged || update.selectionSet) {
            onChangeRef.current(
              update.state.doc.toString(),
              update.state.selection.main.head,
            );
          }
        }),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        ...createInteractionExtensions(getContext, getInteraction),
        EditorView.contentAttributes.of({ spellcheck: 'false' }),
      ];

      const view = new EditorView({
        parent: containerRef.current,
        state: EditorState.create({ doc: value, extensions }),
      });

      viewRef.current = view;
      return () => {
        view.destroy();
        viewRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [compact, placeholderText]);

    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      const current = view.state.doc.toString();
      if (current !== value) {
        view.dispatch({
          changes: { from: 0, to: current.length, insert: value },
          selection: { anchor: Math.min(view.state.selection.main.head, value.length) },
        });
      }
    }, [value]);

    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      view.requestMeasure();
    }, [fieldList, methodList, syntax, tableNames, highlight]);

    return (
      <div
        className={cn(inputWrapClasses, compact && inputWrapCompactClasses, classNames?.editorInput)}
      >
        <div ref={containerRef} className={editorRootClassName(compact, classNames)} />
      </div>
    );
  },
);
