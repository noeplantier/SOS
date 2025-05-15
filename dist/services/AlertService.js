"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
const axios_1 = __importDefault(require("axios"));
class AlertService {
    constructor(apiUrl, apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }
    async sendSMS(contact, message) {
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/sms`, {
                to: contact.phone,
                message: message
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.status === 200;
        }
        catch (error) {
            console.error(`Failed to send SMS to ${contact.name}:`, error);
            return false;
        }
    }
    async sendEmail(contact, subject, message) {
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/email`, {
                to: contact.email,
                subject: subject,
                message: message
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.status === 200;
        }
        catch (error) {
            console.error(`Failed to send email to ${contact.name}:`, error);
            return false;
        }
    }
    async initiateCall(contact, message) {
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/call`, {
                to: contact.phone,
                message: message
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.status === 200;
        }
        catch (error) {
            console.error(`Failed to initiate call to ${contact.name}:`, error);
            return false;
        }
    }
    async sendAppNotification(contact, message) {
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/notification`, {
                userId: contact.id,
                message: message,
                priority: 'high',
                data: {
                    type: 'SOS_ALERT',
                    requiresAction: true
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.status === 200;
        }
        catch (error) {
            console.error(`Failed to send app notification to ${contact.name}:`, error);
            return false;
        }
    }
    async alertContact(contact, options) {
        const results = {};
        if (options.channels.includes('sms') && contact.notificationPreferences.sms) {
            results.sms = await this.sendSMS(contact, options.message);
        }
        if (options.channels.includes('email') && contact.notificationPreferences.email) {
            results.email = await this.sendEmail(contact, 'ALERTE SOS', options.message);
        }
        if (options.channels.includes('call') && contact.notificationPreferences.call) {
            results.call = await this.initiateCall(contact, options.message);
        }
        if (options.channels.includes('app') && contact.notificationPreferences.app) {
            results.app = await this.sendAppNotification(contact, options.message);
        }
        // L'alerte est considérée comme réussie si au moins un canal a fonctionné
        const success = Object.values(results).some(result => result === true);
        return {
            success,
            channels: results
        };
    }
}
exports.AlertService = AlertService;
//# sourceMappingURL=AlertService.js.map