import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent text-xs font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-[#a3efdb] bg-primary text-primary-foreground shadow-sm hover:bg-[#b1f2df]",
        secondary:
          "border-[#38423f] bg-secondary text-secondary-foreground hover:border-[#52665e] hover:bg-[#2b3535]",
        ghost: "text-[#abb3bf] hover:bg-[#242830] hover:text-white",
        outline:
          "border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "border-[#6b4842] bg-[#322522] text-destructive hover:bg-[#3d2c28]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 gap-1.5 px-3 text-[11px]",
        icon: "size-8 px-0",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        size: "icon",
        class:
          "border-[#303641] bg-[#1c2027] text-[#99a3b1] hover:bg-[#2a313a] hover:text-white",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
