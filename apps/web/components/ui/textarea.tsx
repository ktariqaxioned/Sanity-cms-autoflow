import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full rounded-md border border-input bg-[#12151a] px-3 py-2 text-xs leading-relaxed text-foreground outline-none transition-colors placeholder:text-[#6f7886] focus-visible:border-[#6d9f90] focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
