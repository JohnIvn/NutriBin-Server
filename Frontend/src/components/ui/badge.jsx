import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        outline: "bg-transparent border",
        secondary: "bg-secondary text-secondary-foreground",
      },
      size: {
        default: "text-xs",
        sm: "text-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
