"use client";

import { cn } from "@/lib/cn";
import * as React from "react";

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, defaultChecked, checked: controlledChecked, onCheckedChange, disabled, ...props }, ref) => {
    const [uncontrolled, setUncontrolled] = React.useState(defaultChecked ?? false);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : uncontrolled;

    const toggle = () => {
      if (disabled) return;
      const next = !checked;
      if (!isControlled) setUncontrolled(next);
      onCheckedChange?.(next);
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full border border-transparent transition",
          checked ? "bg-brand" : "bg-brand-mist",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        onClick={toggle}
        aria-pressed={checked}
        {...props}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition",
            checked ? "translate-x-5" : "translate-x-1",
          )}
        />
      </button>
    );
  },
);

Switch.displayName = "Switch";
