import React from 'react';
import CapitalOneDashboard from './components/CapitalOneDashboard';
import LoginScreen from './components/Auth/LoginScreen';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, authenticate } = useAuth();

  const handleAuthenticate = (password: string) => {
    authenticate(password);
  };

  return (
    <>
      {!isAuthenticated ? (
        <LoginScreen onAuthenticate={handleAuthenticate} />
      ) : (
        <CapitalOneDashboard />
      )}
    </>
  );
}

export default App
