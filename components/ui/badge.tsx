import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-semibold tracking-[0.01em] transition-[background-color,color,border-color,box-shadow] overflow-hidden [&>svg]:pointer-events-none [&>svg]:size-3 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/10",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/12 text-primary [a&]:hover:bg-primary/16",
        secondary:
          "border-border/70 bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/85",
        destructive:
          "border-transparent bg-destructive/12 text-destructive [a&]:hover:bg-destructive/16",
        outline:
          "border-border/70 bg-background text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }