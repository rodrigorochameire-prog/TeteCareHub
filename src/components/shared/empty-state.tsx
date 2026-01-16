import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: {
    container: "py-8 px-4",
    iconWrapper: "w-12 h-12 mb-3",
    icon: "w-6 h-6",
    title: "text-base",
    description: "text-xs max-w-xs",
  },
  md: {
    container: "py-12 px-4",
    iconWrapper: "w-16 h-16 mb-4",
    icon: "w-8 h-8",
    title: "text-lg",
    description: "text-sm max-w-sm",
  },
  lg: {
    container: "py-16 px-6",
    iconWrapper: "w-20 h-20 mb-5",
    icon: "w-10 h-10",
    title: "text-xl",
    description: "text-base max-w-md",
  },
};

/**
 * EmptyState Premium
 * 
 * Componente elegante para exibir estados vazios.
 * Inclui ícone com gradiente, título, descrição e ações.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className,
}: EmptyStateProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      config.container,
      className
    )}>
      {/* Ícone com gradiente e sombra */}
      <div className={cn(
        "relative rounded-full flex items-center justify-center",
        "bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900",
        "shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.03)]",
        "ring-1 ring-slate-200/50 dark:ring-slate-700/30",
        config.iconWrapper
      )}>
        <Icon className={cn(
          "text-slate-400 dark:text-slate-500",
          config.icon
        )} />
        {/* Brilho decorativo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      </div>
      
      {/* Título */}
      <h3 className={cn(
        "font-semibold text-foreground mb-1.5",
        config.title
      )}>
        {title}
      </h3>
      
      {/* Descrição */}
      <p className={cn(
        "text-muted-foreground mb-5 leading-relaxed",
        config.description
      )}>
        {description}
      </p>
      
      {/* Ações */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            action.href ? (
              <Button asChild variant={action.variant || "default"}>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button 
                onClick={action.onClick} 
                variant={action.variant || "default"}
              >
                {action.label}
              </Button>
            )
          )}
          
          {secondaryAction && (
            secondaryAction.href ? (
              <Button asChild variant="outline">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button onClick={secondaryAction.onClick} variant="outline">
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}

/**
 * EmptyStateCard
 * 
 * Versão em card do EmptyState para usar em grids.
 */
interface EmptyStateCardProps extends EmptyStateProps {
  dashed?: boolean;
}

export function EmptyStateCard({
  dashed = true,
  className,
  ...props
}: EmptyStateCardProps) {
  return (
    <div className={cn(
      "rounded-xl",
      dashed 
        ? "border-2 border-dashed border-slate-200 dark:border-slate-700" 
        : "border border-slate-200 dark:border-slate-800 bg-card",
      "transition-all duration-300",
      "hover:border-primary/30 dark:hover:border-primary/30",
      className
    )}>
      <EmptyState {...props} />
    </div>
  );
}
