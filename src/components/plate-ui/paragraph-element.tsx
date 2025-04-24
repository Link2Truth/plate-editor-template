'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import { PlateElement, withRef } from '@udecode/plate/react';

export const ParagraphElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    return (
      <PlateElement
        ref={ref}
        className={cn(className, 'my-1 px-0 py-1')}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);
