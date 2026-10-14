import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = username.trim().toUpperCase();

    if ((user === 'HAMZA' && password === 'hamza123') || (user === 'AYAN' && password === 'ayan123')) {
      localStorage.setItem('loggedInUser', user);
      setErrorMessage('');
      onLoginSuccess(user); 
    } else {
      setErrorMessage('Ghalat details! Sirf HAMZA aur AYAN allowed hain.');
    }
  };

  return (
    <div style={styles.bodyWrapper}>
      <div className="card border-0" style={styles.loginCard}>
        <h3 className="mb-2 text-primary fw-bold text-center">Water Supply</h3>
        <p className="text-muted mb-4 text-center">Authorized Access Only</p>
        
        {errorMessage && (
          <div className="alert alert-danger py-2 text-center" style={{ fontSize: '0.9rem' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="text-start">
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: '0.9rem' }}>
              Username (HAMZA / AYAN)
            </label>
            <input 
              type="text" 
              className="form-control form-control-lg" 
              placeholder="Enter Name" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold" style={{ fontSize: '0.9rem' }}>
              Password
            </label>
            <input 
              type="password" 
              className="form-control form-control-lg" 
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-100 py-2 fw-bold shadow-sm">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  bodyWrapper: {
    background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Segoe UI", sans-serif'
  },
  loginCard: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px 30px',
    borderRadius: '15px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    backgroundColor: '#fff'
  }
};
