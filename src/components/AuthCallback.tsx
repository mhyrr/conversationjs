import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateGitHubAppJWT } from '../utils/jwt';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const installationId = params.get('installation_id');
      
      if (!installationId) {
        navigate('/');
        return;
      }

      try {
        const jwt = await generateGitHubAppJWT();
        
        // Get installation token
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
      
      navigate('/');
    }

    handleCallback();
  }, [navigate]);

  return <div className="flex justify-center items-center min-h-screen">
    <div className="text-lg">Authenticating...</div>
  </div>;
} 