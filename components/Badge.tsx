import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

// Fonction utilitaire pour combiner les classes CSS
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Définition des variantes du badge avec cva
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-50 text-primary-700 ring-primary-200",
        destructive: "bg-red-50 text-red-700 ring-red-200",
        outline: "bg-transparent text-muted-foreground ring-border",
        success: "bg-green-50 text-green-700 ring-green-200",
        warning: "bg-amber-50 text-amber-700 ring-amber-200",
        info: "bg-blue-50 text-blue-700 ring-blue-200",
        secondary: "bg-secondary-50 text-secondary-700 ring-secondary-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Props du composant Badge avec type des variantes
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Composant Badge optimisé
 * Mémoïsé pour éviter les re-renders inutiles
 * 
 * @example
 * <Badge>Badge</Badge>
 * <Badge variant="destructive">Erreur</Badge>
 * <Badge variant="success">Success</Badge>
 */
const Badge = React.memo<BadgeProps>(
  ({ className, variant, ...props }) => {
    return (
      <div
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

// Optimisation pour React DevTools
Badge.displayName = "Badge";

export { Badge, badgeVariants };
export default Badge;