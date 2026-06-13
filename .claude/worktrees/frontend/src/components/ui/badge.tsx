import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" }>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          variant === "default" && "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
          variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === "outline" && "text-foreground",
          variant === "success" && "border-transparent bg-sage/15 text-sage",
          variant === "warning" && "border-transparent bg-amber/15 text-amber",
          variant === "danger" && "border-transparent bg-paprika/15 text-paprika",
          className,
        )}
        {...props}
      />
    )
  },
)
Badge.displayName = "Badge"

export { Badge }
