"use client";

import React, { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/AlertDialog";
import { useToast } from "./UseToast";
import n8nController from "../lib/useN8n";
import { Loader2, AlertTriangle, Heart, Shield, Wrench } from "lucide-react";

// Types et interfaces
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  asChild?: boolean;
}

interface SOSButtonProps {
  vehicleId?: string;
  driverName?: string;
  location?: string;
  onActivate?: (data: any) => void;
}

interface EmergencyType {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  className: string;
}

// Types d'urgence
const EMERGENCY_TYPES: EmergencyType[] = [
  {
    id: "medical",
    name: "Urgence médicale",
    icon: Heart,
    className: "border-red-200 hover:bg-red-50 hover:text-red-800"
  },
  {
    id: "security", 
    name: "Urgence sécurité",
    icon: Shield,
    className: "border-amber-200 hover:bg-amber-50 hover:text-amber-800"
  },
  {
    id: "technical",
    name: "Urgence technique",
    icon: Wrench,
    className: "border-blue-200 hover:bg-blue-50 hover:text-blue-800"
  }
];

// Composant Button principal
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    // Classes pour les variants et tailles
    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline"
    };
    
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10"
    };
    
    const classes = `inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${variantClasses[variant]} ${sizeClasses[size]} ${className || ""}`;
    
    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

// Composant SOSButton
export function SOSButton({ vehicleId, driverName, location, onActivate }: SOSButtonProps) {
  const [isTriggering, setIsTriggering] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const handleEmergencyTrigger = async (emergencyType: string) => {
    setIsTriggering(true);
    try {
      // Obtenir la localisation actuelle si elle n'est pas fournie
      const currentLocation = location || await getCurrentLocation();
      
      const sosData = {
        emergencyType,
        vehicleId: vehicleId || "unknown",
        location: currentLocation,
        priority: "high",
        description: `Alerte ${emergencyType} déclenchée par ${driverName || "le conducteur"}`,
        timestamp: new Date().toISOString()
      };

      // Déclencher le webhook SOS via l'API n8n
      const webhookUrl = process.env.NEXT_PUBLIC_SOS_WEBHOOK_URL || "http://localhost:5678/webhook/sos";
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(sosData)
      });

      toast({
        title: "Alerte SOS envoyée",
        description: "Les équipes d'urgence ont été notifiées et vous contacteront rapidement.",
        variant: "default",
      });

      // Appeler le callback si fourni
      if (onActivate) {
        onActivate(sosData);
      }

    } catch (error) {
      console.error("Failed to trigger SOS alert:", error);
      toast({
        title: "Erreur d'envoi d'alerte",
        description: "Impossible d'envoyer l'alerte. Veuillez utiliser un autre moyen de contact d'urgence.",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
      setIsConfirmOpen(false);
    }
  };

  const getCurrentLocation = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        resolve("Position inconnue");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(`${position.coords.latitude},${position.coords.longitude}`);
        },
        () => {
          resolve("Position inconnue");
        }
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="lg"
            className="h-32 w-32 rounded-full text-2xl font-bold shadow-lg hover:bg-red-700 focus:ring-4 focus:ring-red-500 transition-all">
            SOS
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Confirmation d'urgence
            </AlertDialogTitle>
            <AlertDialogDescription>
              Veuillez sélectionner le type d'urgence. Cette action enverra une alerte aux équipes concernées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            {EMERGENCY_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant="outline"
                  className={type.className}
                  onClick={() => handleEmergencyTrigger(type.id)}
                  disabled={isTriggering}>
                  {isTriggering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
                  {type.name}
                </Button>
              );
            })}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTriggering}>Annuler</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p className="text-center text-muted-foreground">
        Appuyez pour déclencher une alerte d'urgence
      </p>
    </div>
  );
}