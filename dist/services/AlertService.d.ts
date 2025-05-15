import { Contact } from '../models/Contact';
interface AlertOptions {
    message: string;
    priority: 'high' | 'medium' | 'low';
    channels: ('sms' | 'email' | 'call' | 'app')[];
}
export declare class AlertService {
    private apiUrl;
    private apiKey;
    constructor(apiUrl: string, apiKey: string);
    sendSMS(contact: Contact, message: string): Promise<boolean>;
    sendEmail(contact: Contact, subject: string, message: string): Promise<boolean>;
    initiateCall(contact: Contact, message: string): Promise<boolean>;
    sendAppNotification(contact: Contact, message: string): Promise<boolean>;
    alertContact(contact: Contact, options: AlertOptions): Promise<{
        success: boolean;
        channels: {
            [key: string]: boolean;
        };
    }>;
}
export {};
