import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { me, login, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="app-header">
      <h1>Chessboard Territory Visualization</h1>
      <div className="auth-section">
        {me ? (
          <div className="user-menu">
            <button onClick={() => setMenuOpen(!menuOpen)} className="username-button">
              {me.username}
            </button>
            {menuOpen && (
              <div className="dropdown-menu">
                <button onClick={logout}>Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={login} className="login-button">
            Login with Lichess
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
