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
  ContextMenuCheckboxItem,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/plate-ui/context-menu';

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

export const contextMenuItems = {
  askAI: {
    focusEditor: false,
    icon: <SparklesIcon size={16} className="mr-2" />,
    label: 'Ask AI',
    shortcut: '⌘+J',
    value: 'askAI',
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      editor.getApi(AIChatPlugin).aiChat.show();
    },
  },
  caption: {
    icon: <CaptionsIcon size={16} className="mr-2" />,
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
    icon: <CopyIcon size={16} className="mr-2" />,
    label: 'Copy',
    shortcut: '⌘+C',
    value: 'copy',
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      copySelectedBlocks(editor);
      editor.getApi(BlockSelectionPlugin).blockSelection.focus();
    },
  },
  cut: {
    icon: <ScissorsIcon size={16} className="mr-2" />,
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
    icon: <Trash2 color="red" size={16} className="mr-2" />,
    label: 'Delete',
    shortcut: 'Del',
    value: 'delete',
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      editor.getTransforms(BlockSelectionPlugin).blockSelection.removeNodes();
    },
  },
  duplicate: {
    focusEditor: false,
    icon: <ClipboardCopyIcon size={16} className="mr-2" />,
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
    icon: <AlignLeft size={16} className="mr-2" />,
    items: [
      {
        icon: <AlignLeft size={16} className="mr-2" />,
        label: 'Left',
        value: 'left',
      },
      {
        icon: <AlignCenter size={16} className="mr-2" />,
        label: 'Center',
        value: 'center',
      },
      {
        icon: <AlignRight size={16} className="mr-2" />,
        label: 'Right',
        value: 'right',
      },
    ],
    label: 'Align',
    value: GROUP.ALIGN,
  },
  [GROUP.COLOR]: {
    component: ColorMenuItem,
    filterItems: true,
    icon: <PaletteIcon size={16} className="mr-2" />,
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
    icon: <IndentIcon size={16} className="mr-2" />,
    items: [
      {
        icon: <IndentIcon size={16} className="mr-2" />,
        label: 'Indent',
        value: 'indent',
      },
      {
        icon: <OutdentIcon size={16} className="mr-2" />,
        label: 'Outdent',
        value: 'outdent',
      },
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
  { items: [contextMenuItems.askAI] },
  { items: [contextMenuItems[GROUP.TURN_INTO]] },
  {
    items: [
      contextMenuItems[GROUP.ALIGN],
      contextMenuItems[GROUP.INDENT],
      contextMenuItems[GROUP.COLOR],
    ],
  },
  {
    items: [
      contextMenuItems.copy,
      contextMenuItems.cut,
      contextMenuItems.duplicate,
      contextMenuItems.delete,
    ],
  },
];

const mediaMenuItems = [
  {
    items: [contextMenuItems.caption],
  },
  {
    items: [contextMenuItems[GROUP.ALIGN]],
  },
  {
    items: [
      contextMenuItems.copy,
      contextMenuItems.cut,
      contextMenuItems.duplicate,
      contextMenuItems.delete,
    ],
  },
];

const columnMenuItems = [
  {
    items: [
      contextMenuItems.copy,
      contextMenuItems.cut,
      contextMenuItems.delete,
    ],
  },
];

export function BlockContextMenuItems() {
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
    <>
      {menuGroups.map((group, index) => (
        <ContextMenuGroup key={index}>
          {group.items?.map((item) => {
            const menuItem = contextMenuItems[item.value];

            if (menuItem.component) {
              const ItemComponent = menuItem.component;
              return <ItemComponent key={item.value} />;
            }

            return (
              <ContextMenuItem
                key={item.value}
                onClick={() => {
                  menuItem.onSelect?.({ editor });
                  if (menuItem.focusEditor !== false) editor.tf.focus();
                }}
              >
                <span>{menuItem.icon}</span>
                <span className={item.value === 'delete' ? 'text-red-500' : ''}>
                  {menuItem.label}
                </span>

                {menuItem.shortcut && (
                  <ContextMenuShortcut>{menuItem.shortcut}</ContextMenuShortcut>
                )}
              </ContextMenuItem>
            );
          })}
        </ContextMenuGroup>
      ))}
    </>
  );
}

function AlignMenuItem() {
  const editor = useEditorRef();
  const value = useBlockSelectionFragmentProp({
    key: 'align',
    defaultValue: 'left',
  });

  const menuItems = contextMenuItems[GROUP.ALIGN].items;

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        {contextMenuItems[GROUP.ALIGN].icon}
        {contextMenuItems[GROUP.ALIGN].label}
      </ContextMenuSubTrigger>
      <ContextMenuPortal>
        <ContextMenuSubContent>
          {menuItems.map((item) => (
            <ContextMenuCheckboxItem
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
            </ContextMenuCheckboxItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuPortal>
    </ContextMenuSub>
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

  const menuGroups = contextMenuItems[GROUP.COLOR].items;

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        {contextMenuItems[GROUP.COLOR].icon}
        {contextMenuItems[GROUP.COLOR].label}
      </ContextMenuSubTrigger>
      <ContextMenuPortal>
        <ContextMenuSubContent>
          {menuGroups.map((menuGroup) => (
            <ContextMenuGroup key={menuGroup.group} label={menuGroup.label}>
              <ContextMenuItem className="focus:bg-transparent">
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
              </ContextMenuItem>
            </ContextMenuGroup>
          ))}
        </ContextMenuSubContent>
      </ContextMenuPortal>
    </ContextMenuSub>
  );
}

function IndentMenuItem() {
  const editor = useEditorRef();

  const menuItems = contextMenuItems[GROUP.INDENT].items;

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        {contextMenuItems[GROUP.INDENT].icon}
        {contextMenuItems[GROUP.INDENT].label}
      </ContextMenuSubTrigger>
      <ContextMenuPortal>
        <ContextMenuSubContent>
          {menuItems.map((item) => (
            <ContextMenuItem
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
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuPortal>
    </ContextMenuSub>
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

  const menuItems = contextMenuItems[GROUP.TURN_INTO].items;

  return (
    <ContextMenuItem className="h-full focus:bg-transparent">
      <div className="m-auto grid grid-cols-5 gap-1">
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
      </div>
    </ContextMenuItem>
  );
}
