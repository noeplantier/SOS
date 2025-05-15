import axios from 'axios';
import { Contact } from '../models/Contact';

interface AlertOptions {
  message: string;
  priority: 'high' | 'medium' | 'low';
  channels: ('sms' | 'email' | 'call' | 'app')[];
}

export class AlertService {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async sendSMS(contact: Contact, message: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/sms`,
        {
          to: contact.phone,
          message: message
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error(`Failed to send SMS to ${contact.name}:`, error);
      return false;
    }
  }

  async sendEmail(contact: Contact, subject: string, message: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/email`,
        {
          to: contact.email,
          subject: subject,
          message: message
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error(`Failed to send email to ${contact.name}:`, error);
      return false;
    }
  }

  async initiateCall(contact: Contact, message: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/call`,
        {
          to: contact.phone,
          message: message
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error(`Failed to initiate call to ${contact.name}:`, error);
      return false;
    }
  }

  async sendAppNotification(contact: Contact, message: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/notification`,
        {
          userId: contact.id,
          message: message,
          priority: 'high',
          data: {
            type: 'SOS_ALERT',
            requiresAction: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.status === 200;
    } catch (error) {
      console.error(`Failed to send app notification to ${contact.name}:`, error);
      return false;
    }
  }

  async alertContact(contact: Contact, options: AlertOptions): Promise<{success: boolean, channels: {[key: string]: boolean}}> {
    const results: {[key: string]: boolean} = {};
    
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