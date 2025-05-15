import React from "react";

/**
 * Fonction utilitaire pour fusionner les classes CSS
 */
function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

/**
 * Composant Separator autonome sans dépendance externe
 */
export const Separator = React.memo<SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true }) => {
    return (
      <div
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : orientation}
        className={cn(
          "shrink-0 bg-gray-200 dark:bg-gray-700",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
      />
    );
  }
);

Separator.displayName = "Separator";

export default Separator;