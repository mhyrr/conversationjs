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
        const response = await fetch('http://localhost:3000/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        console.log('Token response:', data);
        
        if (data.access_token) {
          // Store token first
          localStorage.setItem('github_token', data.access_token);
          
          // Small delay to ensure token is stored
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Retry user info fetch up to 3 times
          let attempts = 0;
          while (attempts < 3) {
            try {
              const userResponse = await fetch('https://api.github.com/user', {
                headers: {
                  'Authorization': `token ${data.access_token}`,
                  'Accept': 'application/vnd.github.v3+json'
                }
              });
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                localStorage.setItem('github_user', JSON.stringify(userData));
                break;
              }
              
              attempts++;
              if (attempts < 3) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } catch (error) {
              console.error(`Attempt ${attempts + 1} failed:`, error);
              attempts++;
              if (attempts < 3) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
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

  return <div>Authenticating...</div>;
} 