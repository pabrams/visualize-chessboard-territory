import React from 'react';
import { useLichessAuth } from '../../hooks/useLichessAuth';
import { login } from '../../services/lichessAuth';
import { SettingsMenu } from '../Settings/SettingsMenu';

interface HeaderProps {
  onOpenSidebar: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar, theme, onToggleTheme, onOpenSettings }) => {
  const { user, loading, logout } = useLichessAuth();

  return (
    <header style={{ backgroundColor: '#202020', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #404040' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Hamburger menu */}
        <button
          onClick={onOpenSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            color: '#E0E0E0',
          }}
          aria-label="Open menu"
        >
          <div style={{ width: '24px', height: '2px', backgroundColor: 'currentColor' }} />
          <div style={{ width: '24px', height: '2px', backgroundColor: 'currentColor' }} />
          <div style={{ width: '24px', height: '2px', backgroundColor: 'currentColor' }} />
        </button>

        <h1 style={{ color: '#E0E0E0', margin: 0, fontSize: '24px' }}>Chessboard Territory</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Settings menu with auth */}
        {loading ? (
          <div style={{ color: '#E0E0E0', fontSize: '14px' }}>Loading...</div>
        ) : (
          <SettingsMenu
            theme={theme}
            onToggleTheme={onToggleTheme}
            onOpenSettings={onOpenSettings}
            isLoggedIn={!!user}
            onLogin={login}
            onLogout={logout}
            username={user?.username}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
