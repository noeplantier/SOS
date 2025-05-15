"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const axios_1 = __importDefault(require("axios"));
class ContactService {
    constructor(apiUrl, apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }
    async getVehicleById(vehicleId) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/vehicles/${vehicleId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error(`Failed to get vehicle ${vehicleId}:`, error);
            return null;
        }
    }
    async getContactById(contactId) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/contacts/${contactId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error(`Failed to get contact ${contactId}:`, error);
            return null;
        }
    }
    async getAvailableContacts() {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/contacts?isAvailable=true`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Failed to get available contacts:', error);
            return [];
        }
    }
    async findContactsInZone(location) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/contacts/zone?location=${encodeURIComponent(location)}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error(`Failed to find contacts in zone ${location}:`, error);
            return [];
        }
    }
    async selectContactsForEmergency(criteria) {
        try {
            // 1. Récupérer les contacts prédéfinis du véhicule si disponible
            let selectedContacts = [];
            if (criteria.vehicleId) {
                const vehicle = await this.getVehicleById(criteria.vehicleId);
                if (vehicle && vehicle.emergencyContacts && vehicle.emergencyContacts.length > 0) {
                    // Récupérer les détails de chaque contact prédéfini
                    const contactPromises = vehicle.emergencyContacts.map(id => this.getContactById(id));
                    const contacts = await Promise.all(contactPromises);
                    selectedContacts = contacts.filter(contact => contact !== null);
                }
            }
            // 2. Si pas assez de contacts prédéfinis ou pas de véhicule spécifié
            if (selectedContacts.length < 3) {
                // Récupérer les contacts disponibles dans la zone
                const zoneContacts = await this.findContactsInZone(criteria.location);
                const availableZoneContacts = zoneContacts.filter(contact => contact.isAvailable);
                // Filtrer par type d'urgence
                const specializedContacts = availableZoneContacts.filter(contact => contact.specialties.includes(criteria.emergencyType));
                // Ajouter les contacts spécialisés qui ne sont pas déjà sélectionnés
                for (const contact of specializedContacts) {
                    if (!selectedContacts.some(c => c.id === contact.id)) {
                        selectedContacts.push(contact);
                        if (selectedContacts.length >= 5)
                            break; // Limiter à 5 contacts max
                    }
                }
                // Si encore pas assez, ajouter d'autres contacts disponibles dans la zone
                if (selectedContacts.length < 3) {
                    for (const contact of availableZoneContacts) {
                        if (!selectedContacts.some(c => c.id === contact.id)) {
                            selectedContacts.push(contact);
                            if (selectedContacts.length >= 5)
                                break;
                        }
                    }
                }
            }
            // Trier par priorité
            selectedContacts.sort((a, b) => a.priority - b.priority);
            return selectedContacts;
        }
        catch (error) {
            console.error('Failed to select contacts for emergency:', error);
            return [];
        }
    }
}
exports.ContactService = ContactService;
//# sourceMappingURL=ContactService.js.map