import { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  // Silent Refresh: Check if user has an active cookie session when app mounts
  useEffect(() => {
    const checkPersistedAuth = async () => {
      try {
        const response = await API.get('/refresh');
        setAuth({
          token: response.data.accessToken,
          user: response.data.user,
        });
      } catch (err) {
        // Cookie was missing or expired; user simply needs to sign in manually
        console.log('No active session found.');
      } finally {
        setLoading(false);
      }
    };

    checkPersistedAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};