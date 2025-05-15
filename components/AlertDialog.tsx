"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "../lib/utils";

/**
 * Contexte pour gérer l'état ouvert/fermé de la boîte de dialogue
 * Optimise les performances en évitant la propagation des rendus
 */
const AlertDialogContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
}>({ open: false, setOpen: () => {} });

/**
 * Provider pour l'état de la boîte de dialogue
 */
const AlertDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  
  // Mémoiser la valeur du contexte pour éviter les re-renders inutiles
  const value = React.useMemo(() => ({ open, setOpen }), [open]);
  
  return (
    <AlertDialogContext.Provider value={value}>
      {children}
    </AlertDialogContext.Provider>
  );
};

/**
 * Hook pour accéder à l'état de la boîte de dialogue
 */
const useAlertDialog = () => React.useContext(AlertDialogContext);

/**
 * Composant racine AlertDialog
 * Optimisé avec React.memo pour éviter les rendus inutiles
 */
const AlertDialog = React.memo(({ children, ...props }: AlertDialogPrimitive.AlertDialogProps) => {
  return (
    <AlertDialogProvider>
      <AlertDialogPrimitive.Root {...props}>
        {children}
      </AlertDialogPrimitive.Root>
    </AlertDialogProvider>
  );
});

AlertDialog.displayName = "AlertDialog";

/**
 * Déclencheur de la boîte de dialogue
 * Le composant ne se re-rendra que si la prop 'asChild' change
 */
const AlertDialogTrigger = React.memo<
  AlertDialogPrimitive.AlertDialogTriggerProps
>(({ ...props }) => {
  return <AlertDialogPrimitive.Trigger {...props} />;
});

AlertDialogTrigger.displayName = AlertDialogPrimitive.Trigger.displayName;

/**
 * Gestionnaire de portail pour le contenu de la boîte de dialogue
 * Préchargé pour une transition fluide
 */
const AlertDialogPortal = ({
  className,
  children,
  ...props
}: AlertDialogPrimitive.AlertDialogPortalProps & { className?: string }) => (
  <AlertDialogPrimitive.Portal {...props}>
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}>
      {children}
    </div>
  </AlertDialogPrimitive.Portal>
);

AlertDialogPortal.displayName = AlertDialogPrimitive.Portal.displayName;

/**
 * Superposition qui estompe l'arrière-plan
 * Animé avec une transition fluide
 */
const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));

AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

/**
 * Contenu de la boîte de dialogue
 * Optimisé pour les animations fluides et la navigation au clavier
 */
const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => {
  // Utiliser un ref pour suivre l'animation
  const animatingRef = React.useRef(false);
  const { open } = useAlertDialog();

  // Gérer l'animation de manière optimisée
  React.useEffect(() => {
    if (open) {
      animatingRef.current = true;
      const timer = setTimeout(() => {
        animatingRef.current = false;
      }, 300); // durée de l'animation
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 grid w-full max-w-lg scale-100 gap-4 border bg-background p-6 shadow-lg rounded-lg",
          "sm:max-w-md md:w-full",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-[2%] data-[state=open]:slide-in-from-bottom-[2%]",
          "duration-200",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
});

AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

/**
 * En-tête de la boîte de dialogue
 * Optimisé pour les lecteurs d'écran
 */
const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
);

AlertDialogHeader.displayName = "AlertDialogHeader";

/**
 * Pied de page de la boîte de dialogue
 * Optimisé pour les mises en page réactives
 */
const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);

AlertDialogFooter.displayName = "AlertDialogFooter";

/**
 * Titre de la boîte de dialogue
 * Optimisé pour l'accessibilité
 */
const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));

AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

/**
 * Description de la boîte de dialogue
 * Style optimisé pour la lisibilité
 */
const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

/**
 * Bouton d'action principal
 * Optimisé pour mettre en évidence l'action principale
 */
const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));

AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

/**
 * Bouton d'annulation
 * Stylisé pour être distinct de l'action principale
 */
const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
));

AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};