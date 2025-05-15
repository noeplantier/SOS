"use client";

import React, { useState, useCallback, memo, useRef, useEffect } from "react";
import { AlertTriangle, Heart, Shield, Wrench, Loader2 } from "lucide-react";
import { useToast } from "../components/UseToast";
import { config } from "../lib/config";

// Types
interface SOSButtonProps {
  vehicleId?: string;
  driverName?: string;
  location?: string;
  onActivate?: (data: EmergencyData) => void;
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
}

interface EmergencyData {
  emergencyType: string;
  timestamp: string;
  vehicleId: string;
  location: string;
  driverName: string;
  priority: string;
  description: string;
}

interface EmergencyType {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  className: string;
  priority: "high" | "medium" | "low";
}

// Constants - Évite les re-renders et la recréation d'objets
const EMERGENCY_TYPES: EmergencyType[] = [
  {
    id: "medical",
    name: "Urgence médicale",
    icon: Heart,
    className: "border-red-200 bg-red-50 text-red-800 hover:bg-red-100",
    priority: "high"
  },
  {
    id: "security", 
    name: "Urgence sécurité",
    icon: Shield,
    className: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
    priority: "high"
  },
  {
    id: "technical",
    name: "Urgence technique",
    icon: Wrench,
    className: "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100",
    priority: "medium"
  }
];

/**
 * Composant SOSButton - Déclencheur d'alertes d'urgence optimisé
 * Utilise la mémoïsation pour éviter les rendus inutiles
 */
export const SOSButton = memo(({ 
  vehicleId = "unknown", 
  driverName = "unknown", 
  location, 
  onActivate,
  size = "default",
  disabled = false
}: SOSButtonProps) => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Taille du bouton
  const sizeClasses = {
    sm: "h-16 w-16 text-lg",
    default: "h-24 w-24 text-xl",
    lg: "h-32 w-32 text-2xl"
  };
  
  // Obtenir la localisation actuelle
  const getCurrentPosition = useCallback(async (): Promise<string> => {
    if (!navigator.geolocation) {
      return "unknown";
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      return `${position.coords.latitude},${position.coords.longitude}`;
    } catch (error) {
      console.error("Erreur de géolocalisation:", error);
      return "unknown";
    }
  }, []);
  
  // Charger la localisation au montage
  useEffect(() => {
    if (!location && !currentLocation && !disabled) {
      getCurrentPosition().then(setCurrentLocation);
    }
    
    // Gestion du clic à l'extérieur du dialogue
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location, currentLocation, disabled, isOpen, getCurrentPosition]);
  
  // Ouvrir le dialogue de confirmation
  const handleOpenDialog = useCallback(async () => {
    setIsOpen(true);
    
    // Mettre à jour la localisation si nécessaire
    if (!location && !currentLocation) {
      const position = await getCurrentPosition();
      setCurrentLocation(position);
    }
  }, [location, currentLocation, getCurrentPosition]);
  
  // Déclencher l'urgence
  const handleEmergencyTrigger = useCallback(async (type: string) => {
    if (isTriggering) return;
    
    setIsTriggering(true);
    
    try {
      // Trouver le type d'urgence
      const emergencyType = EMERGENCY_TYPES.find(t => t.id === type);
      if (!emergencyType) throw new Error("Type d'urgence non reconnu");
      
      // Préparer les données
      const emergencyData: EmergencyData = {
        emergencyType: type,
        timestamp: new Date().toISOString(),
        vehicleId,
        location: location || currentLocation || "unknown",
        driverName,
        priority: emergencyType.priority,
        description: `Alerte ${emergencyType.name} déclenchée par ${driverName}`
      };
      
      // Appeler le webhook
      const response = await fetch(config.sosWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emergencyData)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Notifier l'utilisateur
      toast({
        title: "Alerte envoyée",
        description: "Votre alerte a été transmise aux équipes d'intervention.",
      });
      
      // Appeler le callback
      if (onActivate) {
        onActivate(emergencyData);
      }
      
      // Fermer le dialogue
      setIsOpen(false);
      
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'alerte:", error);
      toast({
        title: "Erreur d'envoi",
        description: "Impossible d'envoyer l'alerte, veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  }, [vehicleId, driverName, location, currentLocation, onActivate, isTriggering, toast]);
  
  // Dialogue de confirmation
  const renderDialog = () => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          ref={dialogRef}
          className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200"
        >
          <div className="p-6">
            <div className="flex items-center text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-medium">Confirmation d'urgence</h3>
            </div>
            <p className="text-sm mb-6">
              Sélectionnez le type d'urgence à signaler. Cette alerte sera transmise immédiatement aux équipes d'intervention.
            </p>
            
            <div className="space-y-3">
              {EMERGENCY_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    disabled={isTriggering}
                    onClick={() => handleEmergencyTrigger(type.id)}
                    className={`w-full py-3 px-4 border rounded-md flex items-center justify-between transition-colors ${type.className}`}
                  >
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 mr-2" />
                      <span>{type.name}</span>
                    </div>
                    {isTriggering && <Loader2 className="h-4 w-4 animate-spin" />}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isTriggering}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <button
        onClick={handleOpenDialog}
        disabled={disabled}
        className={`${sizeClasses[size]} rounded-full bg-red-600 text-white font-bold shadow-lg hover:bg-red-700 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:pointer-events-none`}
      >
        SOS
      </button>
      {renderDialog()}
    </>
  );
});

// Optimisation pour React DevTools
SOSButton.displayName = "SOSButton";

export default SOSButton;