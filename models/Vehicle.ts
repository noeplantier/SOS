export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: string;
  driver: {
    id: string;
    name: string;
    phone: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  route?: {
    origin: string;
    destination: string;
    checkpoints: Array<{
      location: string;
      estimatedArrival: Date;
    }>;
  };
  transportDetails?: {
    cargo: string;
    specialRequirements?: string[];
  };
  emergencyContacts: string[]; // IDs des contacts prédéfinis
}