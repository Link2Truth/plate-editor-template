'use client';

import React, { useState } from 'react';

import { BlockMenuPlugin } from '@udecode/plate-selection/react';
import { useEditorRef } from '@udecode/plate/react';

import { BlockMenuItems } from './block-menu-items';
import { ComboboxList, Menu, MenuContent, MenuTrigger } from './menu';

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
    <Menu
      open={open}
      onOpenChange={(open) => {
        setOpen(open);

        if (!open) {
          editor.getApi(BlockMenuPlugin).blockMenu.hide();
        } else if (id) {
          editor.getApi(BlockMenuPlugin).blockMenu.show(id);
        }
      }}
      placement="left"
      trigger={<MenuTrigger>{children}</MenuTrigger>}
    >
      <MenuContent
        autoFocusOnHide={false}
        preventBodyScroll={children ? false : true}
        portal
      >
        <ComboboxList>
          <BlockMenuItems />
        </ComboboxList>
      </MenuContent>
    </Menu>
  );
}
