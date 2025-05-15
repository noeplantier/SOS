"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOSAlert = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class SOSAlert {
    constructor() {
        this.description = {
            displayName: 'SOS Alert',
            name: 'sosAlert',
            icon: 'file:sos.svg',
            group: ['output'],
            version: 1,
            description: 'Déclenche une alerte SOS pour les transports exceptionnels',
            defaults: {
                name: 'SOS Alert',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Type d\'urgence',
                    name: 'emergencyType',
                    type: 'options',
                    options: [
                        {
                            name: 'Médicale',
                            value: 'medical',
                        },
                        {
                            name: 'Sécurité',
                            value: 'security',
                        },
                        {
                            name: 'Technique',
                            value: 'technical',
                        },
                    ],
                    default: 'medical',
                    description: 'Type d\'urgence signalée',
                },
                {
                    displayName: 'Localisation',
                    name: 'location',
                    type: 'string',
                    default: '',
                    description: 'Coordonnées GPS ou description de l\'emplacement',
                },
                {
                    displayName: 'Priorité',
                    name: 'priority',
                    type: 'options',
                    options: [
                        {
                            name: 'Haute',
                            value: 'high',
                        },
                        {
                            name: 'Moyenne',
                            value: 'medium',
                        },
                        {
                            name: 'Basse',
                            value: 'low',
                        },
                    ],
                    default: 'high',
                    description: 'Niveau de priorité de l\'alerte',
                },
                {
                    displayName: 'Description',
                    name: 'description',
                    type: 'string',
                    default: '',
                    description: 'Description détaillée de l\'urgence',
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const emergencyType = this.getNodeParameter('emergencyType', i);
                const location = this.getNodeParameter('location', i);
                const priority = this.getNodeParameter('priority', i);
                const description = this.getNodeParameter('description', i);
                // Ici vous pouvez implémenter la logique pour envoyer l'alerte
                // par exemple vers une API, un service de messagerie, etc.
                const newItem = {
                    json: {
                        success: true,
                        emergencyType,
                        location,
                        priority,
                        description,
                        timestamp: new Date().toISOString(),
                        status: 'sent',
                    },
                };
                returnData.push(newItem);
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            success: false,
                            error: error instanceof Error ? error.message : String(error),
                        },
                    });
                    continue;
                }
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                    itemIndex: i,
                });
            }
        }
        return [returnData];
    }
}
exports.SOSAlert = SOSAlert;
//# sourceMappingURL=execute.js.map