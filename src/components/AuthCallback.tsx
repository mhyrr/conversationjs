import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateGitHubAppJWT } from '../utils/jwt';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const isProd = import.meta.env.PROD;

      if (isProd) {
        // Production: GitHub App flow
        const installationId = params.get('installation_id');
        if (!installationId) {
          navigate('/');
          return;
        }

        try {
          const jwt = await generateGitHubAppJWT();
          const tokenUrl = `https://api.github.com/app/installations/${installationId}/access_tokens`;
          const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `Bearer ${jwt}`,
            }
          });

          const data = await response.json();
          if (data.token) {
            localStorage.setItem('github_token', data.token);
            
            const userResponse = await fetch('https://api.github.com/user', {
              headers: {
                'Authorization': `token ${data.token}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              localStorage.setItem('github_user', JSON.stringify(userData));
            }
          }
        } catch (error) {
          console.error('Auth error:', error);
        }
      } else {
        // Development: OAuth flow
        const code = params.get('code');
        if (!code) {
          navigate('/');
          return;
        }

        try {
          const response = await fetch('http://localhost:3000/auth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();
          console.log('Token response:', data); // Debug log
          
          // GitHub OAuth returns access_token in the response
          if (data.access_token) {
            localStorage.setItem('github_token', data.access_token);
            
            const userResponse = await fetch('https://api.github.com/user', {
              headers: {
                'Authorization': `Bearer ${data.access_token}`, // Changed from 'token' to 'Bearer'
                'Accept': 'application/vnd.github.v3+json'
              }
            });
            
            if (!userResponse.ok) {
              throw new Error(`GitHub API error: ${userResponse.status}`);
            }
            
            const userData = await userResponse.json();
            console.log('User data:', userData); // Debug log
            localStorage.setItem('github_user', JSON.stringify(userData));
          } else {
            console.error('No access token in response:', data);
          }
        } catch (error) {
          console.error('Auth error:', error);
        }
      }
      
      navigate('/');
    }

    handleCallback();
  }, [navigate]);

  return <div className="flex justify-center items-center min-h-screen">
    <div className="text-lg">Authenticating...</div>
  </div>;
} 