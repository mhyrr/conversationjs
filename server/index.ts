import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import { setupViteRewrite } from './vite.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from server directory
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://mhyrr.github.io'],
  credentials: true
}));
app.use(express.json());

app.post('/auth/token', async (req: express.Request, res: express.Response) => {
  const { code } = req.body;

  if (!process.env.VITE_APP_GH_CLIENT_ID || !process.env.VITE_APP_GH_CLIENT_SECRET) {
    console.error('Missing GitHub credentials in environment');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
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

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

// Add the rewrite middleware
setupViteRewrite(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth proxy running on port ${PORT}`);
}); 