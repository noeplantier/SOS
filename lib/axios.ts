import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Gestionnaire d'API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Récupérer les paramètres de la requête
    const { url, method = 'GET', data } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Faire une requête avec axios
    const response = await axios({
      url,
      method,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Renvoyer la réponse
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('API Proxy Error:', error);
    
    return res.status(error.response?.status || 500).json({
      error: error.message,
      response: error.response?.data,
    });
  }
}