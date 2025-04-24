'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateLeaf } from '@udecode/plate/react';

export const KbdLeaf = withRef<typeof PlateLeaf>(
  ({ children, className, ...props }, ref) => (
    <PlateLeaf
      ref={ref}
      as="kbd"
      className={cn(
        className,
        'rounded-md border border-zinc-400/40 bg-zinc-100 px-2 py-1 font-mono text-sm font-semibold text-zinc-800 shadow-[inset_0_-2px_0_0_rgb(0_0_0_/_0.12),_inset_0_1px_1px_0_rgb(255_255_255_/_0.4)] dark:border-zinc-600/40 dark:bg-zinc-800 dark:text-zinc-200 dark:shadow-[inset_0_-2px_0_0_rgb(0_0_0_/_0.4),_inset_0_1px_1px_0_rgb(255_255_255_/_0.1)]'
      )}
      {...props}
    >
      {children}
    </PlateLeaf>
  )
);
