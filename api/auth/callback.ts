import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { code } = request.body;

  if (!code) {
    return response.status(400).json({ error: 'Code is required' });
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.VITE_APP_GH_CLIENT_ID,
        client_secret: process.env.VITE_APP_GH_CLIENT_SECRET,
        code,
      }),
    });

    const data = await tokenResponse.json();
    return response.json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return response.status(500).json({ error: 'Failed to exchange token' });
  }
} 