import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeOperationError,
} from 'n8n-workflow';

export class SOSAlert implements INodeType {
    description: INodeTypeDescription = {
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

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            try {
                const emergencyType = this.getNodeParameter('emergencyType', i) as string;
                const location = this.getNodeParameter('location', i) as string;
                const priority = this.getNodeParameter('priority', i) as string;
                const description = this.getNodeParameter('description', i) as string;

                // Ici vous pouvez implémenter la logique pour envoyer l'alerte
                // par exemple vers une API, un service de messagerie, etc.

                const newItem: INodeExecutionData = {
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
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            success: false,
                            error: error.message,
                        },
                    });
                    continue;
                }
                throw new NodeOperationError(this.getNode(), error as Error, {
                    itemIndex: i,
                });
            }
        }

        return [returnData];
    }
}s