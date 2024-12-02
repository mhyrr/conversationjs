import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (!code) {
        navigate('/');
        return;
      }

      try {
        // In production, trigger the GitHub Action workflow
        if (import.meta.env.PROD) {
          const response = await fetch('https://api.github.com/repos/mhyrr/conversationjs/dispatches', {
            method: 'POST',
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `token ${import.meta.env.VITE_APP_GH_CLIENT_ID}`,
            },
            body: JSON.stringify({
              event_type: 'oauth-callback',
              client_payload: {
                code
              }
            })
          });

          if (response.ok) {
            // Wait for token response
            const tokenResponse = await response.json();
            if (tokenResponse.access_token) {
              localStorage.setItem('github_token', tokenResponse.access_token);
              
              const userResponse = await fetch('https://api.github.com/user', {
                headers: {
                  'Authorization': `token ${tokenResponse.access_token}`,
                  'Accept': 'application/vnd.github.v3+json'
                }
              });
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                localStorage.setItem('github_user', JSON.stringify(userData));
              }
            }
          }
        } else {
          // In development, use the local server
          const response = await fetch('http://localhost:3000/auth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();
          if (data.access_token) {
            localStorage.setItem('github_token', data.access_token);
            
            const userResponse = await fetch('https://api.github.com/user', {
              headers: {
                'Authorization': `token ${data.access_token}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              localStorage.setItem('github_user', JSON.stringify(userData));
            }
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