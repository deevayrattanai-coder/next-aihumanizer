import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 disabled:hover:bg-primary",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:hover:bg-destructive",

        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:hover:bg-background",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:hover:bg-secondary",

        ghost:
          "hover:bg-accent hover:text-accent-foreground disabled:hover:bg-transparent",

        link:
          "text-primary underline-offset-4 hover:underline disabled:no-underline",

        hero:
          "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)] transition-all duration-300 disabled:shadow-none",

        glass:
          "bg-[hsl(var(--glass)/0.6)] backdrop-blur-xl border border-[hsl(var(--glass-border)/0.3)] text-foreground hover:border-[hsl(var(--glass-border)/0.6)] transition-all duration-300 disabled:hover:border-[hsl(var(--glass-border)/0.3)]",
      },

      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };