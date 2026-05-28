import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.95] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary Filled - Green Accent (#00754A)
        default: "bg-green-accent text-white border-green-accent hover:bg-green-accent/90",
        // Primary Outlined - Green Accent border
        outline:
          "border-green-accent bg-transparent text-green-accent hover:bg-green-accent/5",
        // Secondary - Ceramic/warm neutral
        secondary:
          "bg-ceramic text-foreground border-ceramic hover:bg-ceramic/80",
        // Ghost - transparent with hover
        ghost:
          "hover:bg-muted hover:text-foreground",
        // Destructive - Red
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
        // Link style
        link: "text-green-accent underline-offset-4 hover:underline",
        // Black Filled - for "Join now" style CTAs
        black: "bg-black text-white border-black hover:bg-black/90",
        // Dark Outlined - for "Sign in" style
        "dark-outline": "border-foreground bg-transparent text-foreground hover:bg-foreground/5",
        // White Filled - for CTAs on dark green backgrounds
        "inverse": "bg-white text-green-accent border-white hover:bg-white/90",
        // White Outlined - for secondary CTAs on dark backgrounds
        "inverse-outline": "border-white bg-transparent text-white hover:bg-white/10",
      },
      size: {
        default: "h-9 gap-2 px-4 py-[7px]",
        xs: "h-7 gap-1 px-3 py-1 text-xs",
        sm: "h-8 gap-1.5 px-3.5 py-1.5 text-sm",
        lg: "h-10 gap-2 px-5 py-2.5",
        xl: "h-12 gap-2.5 px-6 py-3 text-base",
        icon: "size-9",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        // Frap floating button (56px circle)
        frap: "size-14 rounded-full shadow-[0_0_6px_rgba(0,0,0,0.24),0_8px_12px_rgba(0,0,0,0.14)]",
        "frap-sm": "size-10 rounded-full shadow-[0_0_6px_rgba(0,0,0,0.24),0_8px_12px_rgba(0,0,0,0.14)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
