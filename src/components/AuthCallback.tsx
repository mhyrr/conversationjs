import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      console.log('Callback Debug:', {
        currentUrl: window.location.href,
        code,
        params: Object.fromEntries(params.entries())
      });

      if (!code) {
        console.log('No code found, redirecting home');
        navigate('/');
        return;
      }

      try {
        if (import.meta.env.PROD) {
          console.log('Production: Starting token exchange');
          // Production: Use GitHub API directly
          const tokenUrl = 'https://github.com/login/oauth/access_token';
          const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              client_id: import.meta.env.VITE_APP_GH_CLIENT_ID,
              code,
            })
          });

          const data = await response.json();
          if (data.access_token) {
            localStorage.setItem('github_token', data.access_token);
            
            // Get user info
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
        } else {
          console.log('Development: Using local server');
          // Development: Use local server
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
    <div className="text-lg">
      Authenticating... Check console for debug info.
    </div>
  </div>;
} 