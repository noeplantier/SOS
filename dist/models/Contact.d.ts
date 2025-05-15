export interface Contact {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    priority: number;
    isAvailable: boolean;
    zones: string[];
    specialties: string[];
    notificationPreferences: {
        sms: boolean;
        email: boolean;
        call: boolean;
        app: boolean;
    };
}
export interface ContactSelectionCriteria {
    emergencyType: string;
    location: string;
    priority: string;
    vehicleId?: string;
    requiredSpecialties?: string[];
}
