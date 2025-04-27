'use client';

import { useMemo } from 'react';

import { cn } from '@udecode/cn';
import { TElement } from '@udecode/plate';
import { AIChatPlugin } from '@udecode/plate-ai/react';
import { showCaption } from '@udecode/plate-caption/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
} from '@udecode/plate-font/react';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import {
  BlockSelectionPlugin,
  copySelectedBlocks,
  useBlockSelectionFragmentProp,
  useBlockSelectionNodes,
} from '@udecode/plate-selection/react';
import {
  type PlateEditor,
  ParagraphPlugin,
  useEditorRef,
} from '@udecode/plate/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  CaptionsIcon,
  ClipboardCopyIcon,
  CopyIcon,
  IndentIcon,
  OutdentIcon,
  PaletteIcon,
  ScissorsIcon,
  SparklesIcon,
  Trash2,
} from 'lucide-react';

import { getBlockType, setBlockType } from '@/components/editor/transforms';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/plate-ui/dropdown-menu';

import {
  backgroundColorItems,
  ColorIcon,
  textColorItems,
} from './color-dropdown-menu';
import { TooltipButton } from './tooltip';
import { turnIntoItems } from './turn-into-dropdown-menu';

export const GROUP = {
  ALIGN: 'align',
  BACKGROUND: 'background',
  COLOR: 'color',
  INDENT: 'indent',
  TURN_INTO: 'turn_into',
} as const;

export const blockMenuItems = {
  askAI: {
    focusEditor: false,
    icon: <SparklesIcon />,
    label: 'Ask AI',
    shortcut: '⌘+J',
    value: 'askAI',
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      editor.getApi(AIChatPlugin).aiChat.show();
    },
  },
  caption: {
    icon: <CaptionsIcon />,
    label: 'Caption',
    value: 'caption',
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      const firstBlock = editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.getNodes()[0];
      showCaption(editor, firstBlock[0] as TElement);
      editor.getApi(BlockSelectionPlugin).blockSelection.resetSelectedIds();
    },
  },
  copy: {
    icon: <CopyIcon />,
    label: 'Copy',
    shortcut: '⌘+C',
    value: 'copy',
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      copySelectedBlocks(editor);
      editor.getApi(BlockSelectionPlugin).blockSelection.focus();
    },
  },
  cut: {
    icon: <ScissorsIcon />,
    label: 'Cut',
    shortcut: '⌘+X',
    value: 'cut',
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      copySelectedBlocks(editor);
      editor.getTransforms(BlockSelectionPlugin).blockSelection.removeNodes();
      editor.getApi(BlockSelectionPlugin).blockSelection.focus();
    },
  },
  delete: {
    icon: <Trash2 color="red" />,
    label: 'Delete',
    shortcut: 'Del',
    value: 'delete',
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      editor.getTransforms(BlockSelectionPlugin).blockSelection.removeNodes();
    },
  },
  duplicate: {
    focusEditor: false,
    icon: <ClipboardCopyIcon />,
    label: 'Duplicate',
    shortcut: '⌘+D',
    value: 'duplicate',
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      editor.getTransforms(BlockSelectionPlugin).blockSelection.duplicate();
      editor.getApi(BlockSelectionPlugin).blockSelection.focus();
    },
  },
  [GROUP.ALIGN]: {
    component: AlignMenuItem,
    filterItems: true,
    icon: <AlignLeft />,
    items: [
      { icon: <AlignLeft />, label: 'Left', value: 'left' },
      { icon: <AlignCenter />, label: 'Center', value: 'center' },
      { icon: <AlignRight />, label: 'Right', value: 'right' },
    ],
    label: 'Align',
    value: GROUP.ALIGN,
  },
  [GROUP.COLOR]: {
    component: ColorMenuItem,
    filterItems: true,
    icon: <PaletteIcon />,
    items: [
      { group: GROUP.COLOR, items: textColorItems, label: 'Text color' },
      {
        group: GROUP.BACKGROUND,
        items: backgroundColorItems,
        label: 'Background color',
      },
    ],
    keywords: ['highlight', 'background'],
    label: 'Color',
    value: GROUP.COLOR,
  },
  [GROUP.INDENT]: {
    component: IndentMenuItem,
    filterItems: true,
    icon: <IndentIcon />,
    items: [
      { icon: <IndentIcon />, label: 'Indent', value: 'indent' },
      { icon: <OutdentIcon />, label: 'Outdent', value: 'outdent' },
    ],
    label: 'Indent',
    value: GROUP.INDENT,
  },
  [GROUP.TURN_INTO]: {
    component: TurnIntoMenuItem,
    filterItems: true,
    items: turnIntoItems,
    label: 'Turn into',
    value: GROUP.TURN_INTO,
  },
};

const orderedMenuItems = [
  { items: [blockMenuItems.askAI] },
  { items: [blockMenuItems[GROUP.TURN_INTO]] },
  {
    items: [
      blockMenuItems[GROUP.ALIGN],
      blockMenuItems[GROUP.INDENT],
      blockMenuItems[GROUP.COLOR],
    ],
  },
  {
    items: [
      blockMenuItems.copy,
      blockMenuItems.cut,
      blockMenuItems.duplicate,
      blockMenuItems.delete,
    ],
  },
];

const mediaMenuItems = [
  {
    items: [blockMenuItems.caption],
  },
  {
    items: [blockMenuItems[GROUP.ALIGN]],
  },
  {
    items: [
      blockMenuItems.copy,
      blockMenuItems.cut,
      blockMenuItems.duplicate,
      blockMenuItems.delete,
    ],
  },
];

const columnMenuItems = [
  {
    items: [blockMenuItems.copy, blockMenuItems.cut, blockMenuItems.delete],
  },
];

export function BlockMenuItems() {
  const selectedBlocks = useBlockSelectionNodes();
  const editor = useEditorRef();

  const menuGroups = useMemo(() => {
    const isMedia =
      selectedBlocks.length === 1 &&
      selectedBlocks.some((item) =>
        [
          AudioPlugin.key,
          FilePlugin.key,
          ImagePlugin.key,
          MediaEmbedPlugin.key,
          VideoPlugin.key,
        ].includes(item[0].type as any)
      );

    const isColumn =
      selectedBlocks.length === 1 &&
      selectedBlocks.some((item) =>
        [ColumnPlugin.key].includes(item[0].type as any)
      );

    switch (true) {
      case isMedia:
        return mediaMenuItems;

      case isColumn:
        return columnMenuItems;

      default:
        return orderedMenuItems;
    }
  }, [selectedBlocks]);

  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <div />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="end">
        {menuGroups.map((group, index) => (
          <DropdownMenuGroup key={index}>
            {group.items?.map((item) => {
              const menuItem = blockMenuItems[item.value];

              if (menuItem.component) {
                const ItemComponent = menuItem.component;
                return <ItemComponent key={item.value} />;
              }

              return (
                <DropdownMenuItem
                  key={item.value}
                  onClick={() => {
                    menuItem.onSelect?.({ editor });
                    if (menuItem.focusEditor !== false) editor.tf.focus();
                  }}
                >
                  <span>{menuItem.icon}</span>
                  <span
                    className={item.value === 'delete' ? 'text-red-500' : ''}
                  >
                    {menuItem.label}
                  </span>

                  {menuItem.shortcut && (
                    <DropdownMenuShortcut>
                      {menuItem.shortcut}
                    </DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AlignMenuItem() {
  const editor = useEditorRef();
  const value = useBlockSelectionFragmentProp({
    key: 'align',
    defaultValue: 'left',
  });

  const menuItems = blockMenuItems[GROUP.ALIGN].items;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {blockMenuItems[GROUP.ALIGN].icon}
        {blockMenuItems[GROUP.ALIGN].label}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {menuItems.map((item) => (
            <DropdownMenuCheckboxItem
              key={item.value}
              checked={value === item.value}
              onClick={() => {
                editor
                  .getTransforms(BlockSelectionPlugin)
                  .blockSelection.setNodes({ align: item.value });
                editor.tf.focus();
              }}
            >
              {item.icon}
              {item.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

function ColorMenuItem() {
  const editor = useEditorRef();

  const color = useBlockSelectionFragmentProp({
    key: FontColorPlugin.key,
    defaultValue: 'inherit',
  });
  const background = useBlockSelectionFragmentProp({
    key: FontBackgroundColorPlugin.key,
    defaultValue: 'transparent',
  });

  const handleColorChange = (group: string, value: string) => {
    if (group === GROUP.COLOR) {
      editor
        .getTransforms(BlockSelectionPlugin)
        .blockSelection.setNodes({ color: value });
    } else if (group === GROUP.BACKGROUND) {
      editor
        .getTransforms(BlockSelectionPlugin)
        .blockSelection.setNodes({ backgroundColor: value });
    }

    editor.getApi(BlockSelectionPlugin).blockSelection.focus();
  };

  const menuGroups = blockMenuItems[GROUP.COLOR].items;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {blockMenuItems[GROUP.COLOR].icon}
        {blockMenuItems[GROUP.COLOR].label}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {menuGroups.map((menuGroup) => (
            <DropdownMenuGroup key={menuGroup.group} label={menuGroup.label}>
              <DropdownMenuItem className="focus:bg-transparent">
                <div className="m-auto grid grid-cols-5 gap-1 p-1">
                  {menuGroup.items?.map((item, index) => (
                    <TooltipButton
                      key={index}
                      size="icon"
                      variant="ghost"
                      className={cn(
                        'border hover:border-2',
                        menuGroup.group === GROUP.COLOR
                          ? 'rounded'
                          : 'rounded-full',
                        {
                          'border-2 bg-accent':
                            (menuGroup.group === GROUP.COLOR &&
                              color === item.value) ||
                            (menuGroup.group === GROUP.BACKGROUND &&
                              background === item.value),
                        }
                      )}
                      onClick={() =>
                        handleColorChange(menuGroup.group!, item.value!)
                      }
                      tooltip={item.label}
                    >
                      <ColorIcon value={item.value!} group={menuGroup.group!} />
                    </TooltipButton>
                  ))}
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

function IndentMenuItem() {
  const editor = useEditorRef();

  const menuItems = blockMenuItems[GROUP.INDENT].items;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {blockMenuItems[GROUP.INDENT].icon}
        {blockMenuItems[GROUP.INDENT].label}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.value}
              onClick={() => {
                editor
                  .getTransforms(BlockSelectionPlugin)
                  .blockSelection.setIndent(item.value === 'indent' ? 1 : -1);

                editor.tf.focus();
              }}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

function TurnIntoMenuItem() {
  const editor = useEditorRef();

  const value = useBlockSelectionFragmentProp({
    defaultValue: ParagraphPlugin.key,
    getProp: (node) => getBlockType(node as any),
  });

  const handleTurnInto = (value: string) => {
    editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes()
      .forEach(([, path]) => {
        setBlockType(editor, value, { at: path });
      });
    editor.getApi(BlockSelectionPlugin).blockSelection.focus();
  };

  const menuItems = blockMenuItems[GROUP.TURN_INTO].items;

  return (
    <DropdownMenuItem className="m-auto grid grid-cols-5 gap-1 focus:bg-transparent">
      {menuItems.map((item) => (
        <TooltipButton
          key={item.value}
          variant="ghost"
          className={cn(value === item.value && 'bg-accent', 'h-8 w-8')}
          onClick={() => handleTurnInto(item.value!)}
          tooltip={item.label}
        >
          {item.icon}
        </TooltipButton>
      ))}
    </DropdownMenuItem>
  );
}
