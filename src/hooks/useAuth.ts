import { useState, useEffect } from 'react';

const AUTH_KEY = 'capital_one_auth';
const CORRECT_PASSWORD = 'CapitalOne@2024!';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = () => {
      const authData = localStorage.getItem(AUTH_KEY);
      if (authData) {
        try {
          const { password, timestamp } = JSON.parse(authData);
          const now = Date.now();
          const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours

          // Check if session is still valid and password matches
          if (password === CORRECT_PASSWORD && (now - timestamp) < sessionDuration) {
            setIsAuthenticated(true);
          } else {
            // Session expired or invalid, clear storage
            localStorage.removeItem(AUTH_KEY);
          }
        } catch {
          // Invalid auth data, clear storage
          localStorage.removeItem(AUTH_KEY);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const authenticate = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      const authData = {
        password,
        timestamp: Date.now()
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    authenticate,
    logout
  };
}; 