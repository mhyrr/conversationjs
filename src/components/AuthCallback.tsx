import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotParticipantError, isAuthorizedUser } from '../utils/auth';

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
        if (import.meta.env.PROD) {
            // Use Vercel API route in both dev and prod
          const response = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();
          const accessToken = data.access_token;
          
          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // Check if user is authorized before storing credentials
            if (!isAuthorizedUser(userData.login)) {
              alert(`Sorry, ${userData.login} is not a participant in this conversation - take a look at the participants.json file`);
              navigate('/');
              return;
            }
            
            localStorage.setItem('github_token', accessToken);
            localStorage.setItem('github_user', JSON.stringify({
              login: userData.login,
              accessToken
            }));
          }
        } else {
          const response = await fetch('http://localhost:3000/auth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();
          const accessToken = data.access_token;
          
          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // Check if user is authorized before storing credentials
            if (!isAuthorizedUser(userData.login)) {
              alert(`Sorry, ${userData.login} is not a participant in this conversation - take a look at the participants.json file`);
              navigate('/');
              return;
            }
            
            localStorage.setItem('github_token', accessToken);
            localStorage.setItem('github_user', JSON.stringify({
              login: userData.login,
              accessToken
            }));
          }
        }
      } catch (error) {
        if (error instanceof NotParticipantError) {
          alert(error.message);
        } else {
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