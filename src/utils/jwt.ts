import { SignJWT } from 'jose';
import { importPKCS8 } from 'jose';

export async function generateGitHubAppJWT() {
  const now = Math.floor(Date.now() / 1000);
  const privateKey = import.meta.env.VITE_APP_GH_PRIVATE_KEY;
  const appId = import.meta.env.VITE_APP_GH_APP_ID;

  try {
    const key = await importPKCS8(privateKey, 'RS256');
    const jwt = await new SignJWT({
      iat: now - 60, // Issued 60 seconds ago
      exp: now + (10 * 60), // Expires in 10 minutes
      iss: appId
    })
      .setProtectedHeader({ alg: 'RS256' })
      .sign(key);

    return jwt;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw error;
  }
} 