"use client";

import React, { useEffect, useState } from "react";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import {
  SubscriptPlugin,
  SuperscriptPlugin,
} from "@udecode/plate-basic-marks/react";
import { useEditorRef, useMarkToolbarButtonState } from "@udecode/plate/react";
import { SubscriptIcon, SuperscriptIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

type SuperscriptAndSubscriptDropdownMenuProps = {
  tooltip?: string;
} & DropdownMenuProps;

export function SuperscriptAndSubscriptDropdownMenu({children, tooltip}: SuperscriptAndSubscriptDropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();
  const [value, setValue] = useState("");

  // 检查上下标状态
  const superscriptState = useMarkToolbarButtonState({
    nodeType: SuperscriptPlugin.key,
  });
  const subscriptState = useMarkToolbarButtonState({
    nodeType: SubscriptPlugin.key,
  });
  
  // 当标记状态变化时更新value
  useEffect(() => {
    if (superscriptState.pressed) setValue("superscript");
    else if (subscriptState.pressed) setValue("subscript");
    else setValue("");
  }, [superscriptState.pressed, subscriptState.pressed]);

  return (
    <DropdownMenu modal={false} {...openState}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip={tooltip} isDropdown>
          {children}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar flex max-h-[500px] min-w-[150px] flex-col overflow-y-auto"
        align="start"
      >
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(newValue) => {
            setValue(newValue);
            if (newValue === "superscript") {
              editor.tf.toggleMark(SuperscriptPlugin.key, {
                remove: SubscriptPlugin.key,
              });
            } else if (newValue === "subscript") {
              editor.tf.toggleMark(SubscriptPlugin.key, {
                remove: SuperscriptPlugin.key,
              });
            } else if (newValue === "") {
              // 如果当前有上标或下标，则移除
              if (superscriptState.pressed) {
                editor.tf.toggleMark(SuperscriptPlugin.key);
              }
              if (subscriptState.pressed) {
                editor.tf.toggleMark(SubscriptPlugin.key);
              }
            }
            editor.tf.focus();
          }}
        >
          <DropdownMenuRadioItem value="superscript">
            <div className="flex items-center">
              <SuperscriptIcon className="mr-2" />
              Superscript
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="subscript">
            <div className="flex items-center">
              <SubscriptIcon className="mr-2" />
              Subscript
            </div>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
