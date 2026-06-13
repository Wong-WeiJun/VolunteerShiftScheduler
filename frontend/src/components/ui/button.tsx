import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "danger"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-primary text-primary-foreground hover:bg-terracotta-dark shadow-sm",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-cream-deep",
          variant === "outline" && "border border-input bg-background hover:bg-muted hover:text-accent-foreground",
          variant === "ghost" && "hover:bg-muted hover:text-accent-foreground",
          variant === "danger" && "bg-paprika text-white hover:bg-red-700 shadow-sm",
          size === "default" && "h-10 px-4 py-2 text-sm",
          size === "sm" && "h-8 rounded-md px-3 text-xs",
          size === "lg" && "h-11 rounded-md px-8 text-base",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button }
