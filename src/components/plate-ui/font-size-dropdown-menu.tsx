'use client';

import type { TElement } from '@udecode/plate';

import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { toUnitLess } from '@udecode/plate-font';
import { FontSizePlugin } from '@udecode/plate-font/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { useEditorPlugin, useEditorSelector } from '@udecode/plate/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

const DEFAULT_FONT_SIZE = '16';

const FONT_SIZE_MAP = {
  [HEADING_KEYS.h1]: '36',
  [HEADING_KEYS.h2]: '24',
  [HEADING_KEYS.h3]: '20',
} as const;

const FONT_SIZES = [
  '8',
  '9',
  '10',
  '12',
  '14',
  '16',
  '18',
  '20',
  '22',
  '24',
] as const;

export function FontSizeDropdownMenu(props: DropdownMenuProps) {
  const { api, editor } = useEditorPlugin(FontSizePlugin);
  const openState = useOpenState();

  const cursorFontSize = useEditorSelector((editor) => {
    const fontSize = editor.api.marks()?.[FontSizePlugin.key];

    if (fontSize) {
      return toUnitLess(fontSize as string);
    }

    const [block] = editor.api.block<TElement>() || [];

    if (!block?.type) return DEFAULT_FONT_SIZE;

    return block.type in FONT_SIZE_MAP
      ? FONT_SIZE_MAP[block.type as keyof typeof FONT_SIZE_MAP]
      : DEFAULT_FONT_SIZE;
  }, []);

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton 
          className="min-w-[3rem]"
          pressed={openState.open}
          tooltip="Font size"
          isDropdown
        >
          {cursorFontSize}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className='ignore-click-outside/toolbar min-w-[80px]' 
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          editor.tf.focus();
        }}
        align="start"
      >
        <DropdownMenuRadioGroup 
          value={cursorFontSize}
          onValueChange={(size) => {
            api.fontSize.setMark(`${size}px`);
            editor.tf.focus();
          }}
        >
          {FONT_SIZES.map((size) => (
            <DropdownMenuRadioItem
              key={size}
              value={size}
            >
              {size}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}