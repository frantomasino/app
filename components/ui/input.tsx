import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input bg-background flex h-10 w-full min-w-0 rounded-lg border px-3 py-2 text-sm text-foreground transition-[border-color,box-shadow,background-color] outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/10",
        className,
      )}
      {...props}
    />
  )
}

export { Input }