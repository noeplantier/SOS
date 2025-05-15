import { Contact, ContactSelectionCriteria } from '../models/Contact';
import { Vehicle } from '../models/Vehicle';
export declare class ContactService {
    private apiUrl;
    private apiKey;
    constructor(apiUrl: string, apiKey: string);
    getVehicleById(vehicleId: string): Promise<Vehicle | null>;
    getContactById(contactId: string): Promise<Contact | null>;
    getAvailableContacts(): Promise<Contact[]>;
    findContactsInZone(location: string): Promise<Contact[]>;
    selectContactsForEmergency(criteria: ContactSelectionCriteria): Promise<Contact[]>;
}
