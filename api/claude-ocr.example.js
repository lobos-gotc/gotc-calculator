/**
 * Example Serverless Function for Claude OCR Proxy
 * 
 * Deploy this to:
 * - Vercel: /api/claude-ocr.js
 * - Netlify: /netlify/functions/claude-ocr.js
 * - AWS Lambda
 * 
 * Set ANTHROPIC_API_KEY in your environment variables
 */

// For Vercel/Next.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
        
    } catch (error) {
        console.error('Claude API Error:', error);
        return res.status(500).json({ error: 'Failed to call Claude API' });
    }
}

// For Netlify Functions
// exports.handler = async (event) => {
//     if (event.httpMethod !== 'POST') {
//         return { statusCode: 405, body: 'Method not allowed' };
//     }
//     
//     const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
//     const body = JSON.parse(event.body);
//     
//     const response = await fetch('https://api.anthropic.com/v1/messages', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'x-api-key': ANTHROPIC_API_KEY,
//             'anthropic-version': '2023-06-01'
//         },
//         body: JSON.stringify(body)
//     });
//     
//     const data = await response.json();
//     return {
//         statusCode: response.status,
//         body: JSON.stringify(data)
//     };
// };




