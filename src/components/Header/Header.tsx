import React from 'react';
import { useLichessAuth } from '../../hooks/useLichessAuth';
import { login } from '../../services/lichessAuth';
import { SettingsMenu } from '../Settings/SettingsMenu';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onOpenSettings }) => {
  const { user, loading, logout } = useLichessAuth();

  return (
    <header style={{ backgroundColor: '#202020', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #404040' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{ color: '#E0E0E0', margin: 0, fontSize: '24px' }}>Chess Drill</h1>
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
