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
        // Use Vercel API route in both dev and prod
        const response = await fetch('/api/auth/callback', {
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