'use client';

import React, { useState } from 'react';

import { BlockMenuPlugin } from '@udecode/plate-selection/react';
import { useEditorRef } from '@udecode/plate/react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/plate-ui/popover';

import { BlockMenuItems } from './block-menu-items';

export function BlockMenu({
  id,
  children,
}: {
  id?: string;
  children?: React.ReactNode;
}) {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          editor.getApi(BlockMenuPlugin).blockMenu.hide();
        } else if (id) {
          editor.getApi(BlockMenuPlugin).blockMenu.show(id);
        }
      }}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="m-0 h-0 w-0 p-0">
        <BlockMenuItems />
      </PopoverContent>
    </Popover>
  );
}
