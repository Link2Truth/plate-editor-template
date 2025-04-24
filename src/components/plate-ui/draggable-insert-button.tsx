'use client';

import React from 'react';

import type { Path } from '@udecode/plate';

import { nanoid, PathApi } from '@udecode/plate';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { ParagraphPlugin } from '@udecode/plate/react';
import {
  type PlateEditor,
  useEditorRef,
  useElement,
} from '@udecode/plate/react';
import { Plus } from 'lucide-react';

import { TooltipButton } from './tooltip';

export const DraggableInsertButton = () => {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <TooltipButton
      variant="ghost"
      className="size-6 p-1"
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();

        const at = editor.api.findPath(element);
        triggerComboboxNextBlock(editor, '/', at, event.altKey);
      }}
      onMouseDown={() => {
        editor.tf.focus();
        editor.getApi(BlockSelectionPlugin).blockSelection.clear();
      }}
      tabIndex={-1}
      tooltip="Click to add below"
      tooltipContentProps={{
        side: 'top',
      }}
    >
      <Plus className="text-muted-foreground" />
    </TooltipButton>
  );
};

const triggerComboboxNextBlock = (
  editor: PlateEditor,
  triggerText: string,
  at?: Path,
  insertAbove = false
) => {
  const emptyBlock = {
    id: nanoid(),
    children: [{ text: '' }],
    type: ParagraphPlugin.key,
  };

  let _at: Path | undefined;

  if (at) {
    const slicedPath = at.slice(0, 1);
    _at = insertAbove ? slicedPath : PathApi.next(slicedPath);
  }

  editor.tf.insertNodes(emptyBlock, {
    at: _at,
    select: true,
  });
  editor.tf.insertText(triggerText);
};
