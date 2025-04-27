'use client';

import { useState } from 'react';

import {
  BLOCK_CONTEXT_MENU_ID,
  BlockMenuPlugin,
} from '@udecode/plate-selection/react';
import { useEditorPlugin, usePlateState } from '@udecode/plate/react';

import { useIsTouchDevice } from '@/hooks/use-is-touch-device';

import { BlockContextMenuItems } from './block-context-menu-items';
import {
  ContextMenu,
  ContextMenuContent,
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
      <ContextMenuContent className="w-[200px]">
        <BlockContextMenuItems />
      </ContextMenuContent>
    </ContextMenu>
  );
}
