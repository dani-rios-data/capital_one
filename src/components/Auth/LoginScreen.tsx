import React, { useState } from 'react';
import './LoginScreen.css';

interface LoginScreenProps {
  onAuthenticate: (password: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication delay
    setTimeout(() => {
      if (password === 'CapitalOne@2024!') {
        onAuthenticate(password);
      } else {
        setError('Invalid password. Please try again.');
        setPassword('');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-pattern"></div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <img src="/Capital_One_logo.svg" alt="Capital One" className="login-logo" />
            <div className="login-divider"></div>
            <h1 className="login-title">Secure Access Required</h1>
            <p className="login-subtitle">
              Please enter your password to access the advertising analytics dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`login-input ${error ? 'error' : ''}`}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
              </div>
              {error && (
                <div className="error-message">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {error}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12,5 19,12 12,19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <div className="security-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Secured by Capital One</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen; 