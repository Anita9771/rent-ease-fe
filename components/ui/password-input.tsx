"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

export type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  containerClassName?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className, containerClassName, disabled, id, autoComplete = "current-password", ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", containerClassName)}>
      <input
        ref={ref}
        id={id}
        type={visible ? "text" : "password"}
        disabled={disabled}
        autoComplete={autoComplete}
        className={cn(
          "w-full rounded-xl border border-brand-mist bg-white py-3 pl-4 pr-11 text-brand-dark placeholder:text-brand-slate focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        {...(id ? { "aria-controls": id } : {})}
        onClick={() => setVisible((show) => !show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-brand-slate transition-colors hover:text-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-50"
      >
        {visible ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
