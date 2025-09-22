import { useState, useEffect } from 'react';
import { LichessUser } from '../types/lichess';
import { handleRedirect } from '../services/lichessAuth';

const LICHESS_HOST = 'https://lichess.org';

export const useLichessAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<LichessUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {

      try {
        const accessToken = await handleRedirect();
        if (accessToken) {
          localStorage.setItem('lichessToken', accessToken);
          setToken(accessToken);
        } else {
          const storedToken = localStorage.getItem('lichessToken');
          if (storedToken) {
            console.log('Using stored token:', storedToken);
            setToken(storedToken);
          } else {
            console.log('No stored token found');
          }
        }
      } catch (error) {
        console.error('Error in initAuth:', error);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await fetch(`${LICHESS_HOST}/api/account`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token might be expired, log out
            logout();
          }
        } catch (error) {
          console.error('Failed to fetch user data', error);
          logout();
        }
      }
    };

    fetchUser();
  }, [token]);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lichessToken');
  };

  return { token, user, loading, logout };
};
