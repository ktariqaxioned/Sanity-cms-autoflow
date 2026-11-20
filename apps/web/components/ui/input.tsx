import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border border-input bg-[#12151a] px-3 text-xs text-foreground outline-none transition-colors placeholder:text-[#6f7886] focus-visible:border-[#6d9f90] focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
