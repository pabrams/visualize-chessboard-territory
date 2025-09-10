import React, { useState } from 'react';
import { LichessUser } from '../../types/lichess';

interface UserMenuProps {
  user: LichessUser;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', color: '#E0E0E0', cursor: 'pointer', fontSize: '16px' }}>
        {user.username}
      </button>
      {isOpen && (
        <div style={{ position: 'absolute', top: '30px', right: 0, backgroundColor: '#303030', borderRadius: '4px', padding: '10px', zIndex: 1 }}>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#E0E0E0', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
