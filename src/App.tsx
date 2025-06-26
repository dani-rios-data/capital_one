import React from 'react';
import CapitalOneDashboard from './components/CapitalOneDashboard';
import LoginScreen from './components/Auth/LoginScreen';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, isLoading, authenticate } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #003057 0%, #004678 100%)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

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
