import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-250 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Primary - Laranja
        default:
          "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-[0_1px_3px_hsl(24_92%_50%/0.25)]",
        // Secondary - Neutro
        secondary:
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        // Destructive - Vermelho
        destructive:
          "bg-red-50 text-red-700 shadow-[0_1px_3px_hsl(0_70%_45%/0.1)] dark:bg-red-900/30 dark:text-red-400",
        // Outline
        outline: "text-foreground border-[1.5px] border-border",
        // Success - Verde (Cheio/OK)
        success:
          "bg-emerald-50 text-emerald-700 shadow-[0_1px_3px_hsl(142_70%_40%/0.1)] dark:bg-emerald-900/30 dark:text-emerald-400",
        // Warning - Amarelo (Atenção)
        warning:
          "bg-amber-50 text-amber-700 shadow-[0_1px_3px_hsl(45_90%_45%/0.12)] dark:bg-amber-900/30 dark:text-amber-400",
        // Info - Azul (Informativo)
        info:
          "bg-sky-50 text-sky-700 shadow-[0_1px_3px_hsl(200_65%_45%/0.1)] dark:bg-sky-900/30 dark:text-sky-400",
        // Navy - Azul escuro (Destaque)
        navy:
          "bg-slate-700 text-white shadow-[0_1px_3px_hsl(215_30%_20%/0.2)] dark:bg-slate-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "variant">,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
