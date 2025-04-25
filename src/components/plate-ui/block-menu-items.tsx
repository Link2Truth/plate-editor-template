'use client';

import React, { useMemo } from 'react';

import { cn } from '@udecode/cn';
import { TElement } from '@udecode/plate';
import { AIChatPlugin } from '@udecode/plate-ai/react';
import { showCaption } from '@udecode/plate-caption/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
} from '@udecode/plate-font/react';
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
  RefreshCwIcon,
  ScissorsIcon,
  SparklesIcon,
  Trash2,
} from 'lucide-react';

import { getBlockType, setBlockType } from '@/components/editor/transforms';

import {
  backgroundColorItems,
  ColorIcon,
  textColorItems,
} from './color-dropdown-menu';
import {
  type Action,
  filterMenuGroups,
  filterMenuItems,
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuTrigger,
  useComboboxValueState,
} from './menu';
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
    keywords: ['generate', 'help', 'chat'],
    label: 'Ask AI',
    shortcut: '⌘+J',
    value: 'askAI',
    onSelect: ({ editor }: { editor: PlateEditor }) => {
      editor.getApi(AIChatPlugin).aiChat.show();
    },
  },
  caption: {
    icon: <CaptionsIcon />,
    keywords: ['alt'],
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
    keywords: ['copy'],
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
    keywords: ['cut'],
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
    keywords: ['remove'],
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
    keywords: ['copy'],
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
    icon: <RefreshCwIcon />,
    items: turnIntoItems,
    label: 'Turn into',
    value: GROUP.TURN_INTO,
  },
};

const orderedMenuItems = [
  { items: [blockMenuItems.askAI] },
  {
    items: [blockMenuItems[GROUP.TURN_INTO]],
  },
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

export function BlockMenuItems() {
  const [searchValue] = useComboboxValueState();
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

    const items = isMedia ? mediaMenuItems : orderedMenuItems;

    return filterMenuGroups(items, searchValue) || items;
  }, [selectedBlocks, searchValue]);

  return (
    <>
      {menuGroups.map((group, index) => (
        <MenuGroup key={index} label={group.label}>
          {group.items?.map((item: Action) => {
            const menuItem = blockMenuItems[item.value!];

            if (menuItem.component) {
              const ItemComponent = menuItem.component;
              return <ItemComponent key={item.value} />;
            }

            return (
              <MenuItem
                key={item.value}
                className={item.value === 'delete' ? 'text-red-500' : ''}
                onClick={() => {
                  menuItem.onSelect?.({ editor });
                  if (menuItem.focusEditor !== false) editor.tf.focus();
                }}
                label={menuItem.label}
                icon={menuItem.icon}
                shortcut={menuItem.shortcut}
              />
            );
          })}
        </MenuGroup>
      ))}
    </>
  );
}

function AlignMenuItem() {
  const [searchValue] = useComboboxValueState();
  const editor = useEditorRef();
  const value = useBlockSelectionFragmentProp({
    key: 'align',
    defaultValue: 'left',
  });

  const menuItems = useMemo(() => {
    return filterMenuItems(blockMenuItems[GROUP.ALIGN], searchValue);
  }, [searchValue]);

  const content = (
    <>
      {menuItems.map((item) => (
        <MenuItem
          key={item.value}
          checked={value === item.value}
          onClick={() => {
            editor
              .getTransforms(BlockSelectionPlugin)
              .blockSelection.setNodes({ align: item.value });
            editor.tf.focus();
          }}
          label={item.label}
          icon={item.icon}
        />
      ))}
    </>
  );

  if (searchValue)
    return (
      <MenuGroup label={blockMenuItems[GROUP.ALIGN].label}>{content}</MenuGroup>
    );

  return (
    <Menu
      placement="right"
      trigger={
        <MenuTrigger
          label={blockMenuItems[GROUP.ALIGN].label}
          icon={blockMenuItems[GROUP.ALIGN].icon}
        />
      }
    >
      <MenuContent portal>
        <MenuGroup>{content}</MenuGroup>
      </MenuContent>
    </Menu>
  );
}

function IndentMenuItem() {
  const [searchValue] = useComboboxValueState();
  const editor = useEditorRef();

  const menuItems = useMemo(() => {
    return filterMenuItems(blockMenuItems[GROUP.INDENT], searchValue);
  }, [searchValue]);

  const content = (
    <>
      {menuItems.map((item) => (
        <MenuItem
          key={item.value}
          onClick={() => {
            editor
              .getTransforms(BlockSelectionPlugin)
              .blockSelection.setIndent(item.value === 'indent' ? 1 : -1);

            editor.tf.focus();
          }}
          label={item.label}
          icon={item.icon}
        />
      ))}
    </>
  );

  if (searchValue)
    return (
      <MenuGroup label={blockMenuItems[GROUP.INDENT].label}>
        {content}
      </MenuGroup>
    );

  return (
    <Menu
      placement="right"
      trigger={
        <MenuTrigger
          label={blockMenuItems[GROUP.INDENT].label}
          icon={blockMenuItems[GROUP.INDENT].icon}
        />
      }
    >
      <MenuContent portal>
        <MenuGroup>{content}</MenuGroup>
      </MenuContent>
    </Menu>
  );
}

function ColorMenuItem() {
  const [searchValue] = useComboboxValueState();
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

  const menuGroups = useMemo(() => {
    return filterMenuGroups(blockMenuItems[GROUP.COLOR].items, searchValue);
  }, [searchValue]);

  const content = (
    <>
      {menuGroups.map((menuGroup) => (
        <MenuGroup key={menuGroup.group} label={menuGroup.label}>
          <MenuItem className="hover:bg-transparent">
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
                      'border-2 bg-muted':
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
          </MenuItem>
        </MenuGroup>
      ))}
    </>
  );

  if (searchValue) return content;

  return (
    <Menu
      placement="right"
      trigger={
        <MenuTrigger
          label={blockMenuItems[GROUP.COLOR].label}
          icon={blockMenuItems[GROUP.COLOR].icon}
        />
      }
    >
      <MenuContent portal>{content}</MenuContent>
    </Menu>
  );
}

function TurnIntoMenuItem() {
  const editor = useEditorRef();
  const [searchValue] = useComboboxValueState();

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

  const menuItems = useMemo(() => {
    return filterMenuItems(blockMenuItems[GROUP.TURN_INTO], searchValue);
  }, [searchValue]);

  return (
    <MenuItem className="hover:bg-transparent">
      <div className="m-auto grid grid-cols-5 gap-2 p-2">
        {menuItems.map((item) => (
          <TooltipButton
            key={item.value}
            size="icon"
            variant="ghost"
            className={cn(value === item.value && 'bg-muted')}
            onClick={() => handleTurnInto(item.value!)}
            tooltip={item.label}
          >
            {item.icon}
          </TooltipButton>
        ))}
      </div>
    </MenuItem>
  );
}
