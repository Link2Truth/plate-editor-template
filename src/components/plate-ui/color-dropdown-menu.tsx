'use client';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { cn } from '@udecode/cn';
import {
  useColorDropdownMenu,
  useColorDropdownMenuState,
} from '@udecode/plate-font/react';

import { DEFAULT_COLORS, DEFAULT_CUSTOM_COLORS } from './color-constants';
import { ColorPicker } from './color-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

type ColorDropdownMenuProps = {
  nodeType: string;
  tooltip?: string;
} & DropdownMenuProps;

export const textColorItems: { label: string; value: string }[] = [
  { label: 'Default', value: 'inherit' },
  { label: 'Gray', value: 'rgb(123, 122, 116)' },
  { label: 'Brown', value: 'rgb(162, 110, 83)' },
  { label: 'Orange', value: 'rgb(215, 110, 30)' },
  { label: 'Yellow', value: 'rgb(205, 147, 47)' },
  { label: 'Green', value: 'rgb(39, 124, 112)' },
  { label: 'Blue', value: 'rgb(59, 109, 178)' },
  { label: 'Purple', value: 'rgb(122, 68, 178)' },
  { label: 'Pink', value: 'rgb(168, 62, 111)' },
  { label: 'Red', value: 'rgb(190, 55, 55)' },
];

export const backgroundColorItems: { label: string; value: string }[] = [
  { label: 'Default', value: 'transparent' },
  { label: 'Gray', value: 'rgb(241, 241, 239)' },
  { label: 'Brown', value: 'rgb(235, 229, 220)' },
  { label: 'Orange', value: 'rgb(254, 235, 200)' },
  { label: 'Yellow', value: 'rgb(254, 249, 195)' },
  { label: 'Green', value: 'rgb(204, 251, 241)' },
  { label: 'Blue', value: 'rgb(219, 234, 254)' },
  { label: 'Purple', value: 'rgb(243, 232, 255)' },
  { label: 'Pink', value: 'rgb(252, 231, 243)' },
  { label: 'Red', value: 'rgb(254, 226, 226)' },
];

export const ColorIcon = ({
  className,
  group,
  value,
}: {
  group: string;
  value: string;
  className?: string;
}) => (
  <div
    className={cn(
      'flex min-h-5 min-w-5 items-center justify-center rounded-full text-sm',
      className
    )}
    style={{
      background: group === 'background' ? value : undefined,
      color: group === 'color' ? value : undefined,
    }}
  >
    {group === 'color' && 'A'}
  </div>
);

export function ColorDropdownMenu({
  children,
  nodeType,
  tooltip,
}: ColorDropdownMenuProps) {
  const state = useColorDropdownMenuState({
    closeOnSelect: true,
    colors: DEFAULT_COLORS,
    customColors: DEFAULT_CUSTOM_COLORS,
    nodeType,
  });

  const { buttonProps, menuProps } = useColorDropdownMenu(state);

  return (
    <DropdownMenu modal={false} {...menuProps}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton tooltip={tooltip} {...buttonProps}>
          {children}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <ColorPicker
          color={state.selectedColor || state.color}
          clearColor={state.clearColor}
          colors={state.colors}
          customColors={state.customColors}
          updateColor={state.updateColorAndClose}
          updateCustomColor={state.updateColor}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
