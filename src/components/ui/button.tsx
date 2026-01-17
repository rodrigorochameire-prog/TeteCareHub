import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_hsl(24_92%_50%/0.45),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_4px_16px_-2px_hsl(24_92%_50%/0.5)] hover:translate-y-[-1px] active:translate-y-0 active:shadow-[0_1px_4px_-1px_hsl(24_92%_50%/0.4)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_2px_8px_-2px_hsl(0_72%_50%/0.4)] hover:shadow-[0_4px_16px_-2px_hsl(0_72%_50%/0.5)] hover:translate-y-[-1px] active:translate-y-0",
        outline:
          "border-[1.5px] border-border bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:translate-y-[-1px] active:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:translate-y-[-1px] active:bg-secondary/70",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)] active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/90 active:scale-100",
        // Variante Navy para ações secundárias importantes
        navy: "bg-gradient-to-b from-slate-700 to-slate-800 text-white shadow-[0_2px_8px_-2px_hsl(215_30%_20%/0.45),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_4px_16px_-2px_hsl(215_30%_18%/0.5)] hover:translate-y-[-1px] dark:from-slate-600 dark:to-slate-700",
        // Variante success
        success: "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_-2px_hsl(142_72%_40%/0.45),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_4px_16px_-2px_hsl(142_72%_40%/0.5)] hover:translate-y-[-1px]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3.5",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10 rounded-xl",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
