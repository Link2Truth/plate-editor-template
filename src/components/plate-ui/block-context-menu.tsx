'use client';

import { useState } from 'react';

import { AIChatPlugin } from '@udecode/plate-ai/react';
import {
  BLOCK_CONTEXT_MENU_ID,
  BlockMenuPlugin,
  BlockSelectionPlugin,
  copySelectedBlocks,
} from '@udecode/plate-selection/react';
import { useEditorPlugin, usePlateState } from '@udecode/plate/react';
import {
  ClipboardCopyIcon,
  CopyIcon,
  ScissorsIcon,
  SparklesIcon,
  TrashIcon,
} from 'lucide-react';

import { useIsTouchDevice } from '@/hooks/use-is-touch-device';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from './context-menu';

type Value = 'askAI' | null;

export function BlockContextMenu({ children }: { children: React.ReactNode }) {
  const { api, editor } = useEditorPlugin(BlockMenuPlugin);
  const [value, setValue] = useState<Value>(null);
  const isTouch = useIsTouchDevice();
  const [readOnly] = usePlateState('readOnly');

  if (isTouch) {
    return children;
  }

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (!open) {
          // prevent unselect the block selection
          setTimeout(() => {
            api.blockMenu.hide();
          }, 0);
        }
      }}
      modal={false}
    >
      <ContextMenuTrigger
        asChild
        onContextMenu={(event) => {
          const dataset = (event.target as HTMLElement).dataset;

          const disabled = dataset?.slateEditor === 'true' || readOnly;

          if (disabled) return event.preventDefault();

          api.blockMenu.show(BLOCK_CONTEXT_MENU_ID, {
            x: event.clientX,
            y: event.clientY,
          });
        }}
      >
        <div className="w-full">{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent
        className="w-64"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          editor.getApi(BlockSelectionPlugin).blockSelection.focus();

          if (value === 'askAI') {
            editor.getApi(AIChatPlugin).aiChat.show();
          }

          setValue(null);
        }}
      >
        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() => {
              setValue('askAI');
            }}
          >
            <SparklesIcon size={16} className="mr-2" />
            Ask AI
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => {
              copySelectedBlocks(editor);
            }}
          >
            <CopyIcon size={16} className="mr-2" />
            Copy
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => {
              copySelectedBlocks(editor);
              editor
                .getTransforms(BlockSelectionPlugin)
                .blockSelection.removeNodes();
            }}
          >
            <ScissorsIcon size={16} className="mr-2" />
            Cut
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => {
              editor
                .getTransforms(BlockSelectionPlugin)
                .blockSelection.duplicate();
            }}
          >
            <ClipboardCopyIcon size={16} className="mr-2" />
            Duplicate
          </ContextMenuItem>
        </ContextMenuGroup>

        <ContextMenuGroup>
          <ContextMenuItem
            className="text-red-500"
            onClick={() => {
              editor
                .getTransforms(BlockSelectionPlugin)
                .blockSelection.removeNodes();
              editor.tf.focus();
            }}
          >
            <TrashIcon size={16} className="mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
