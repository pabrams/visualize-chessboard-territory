import { useLichessAuth } from '../../hooks/useLichessAuth';
import { login } from '../../services/lichessAuth';
import UserMenu from '../UserMenu/UserMenu';

const Header = () => {
  const { user, loading, logout } = useLichessAuth();

  return (
    <header style={{ backgroundColor: '#202020', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #404040' }}>
      <h1 style={{ color: '#E0E0E0', margin: 0, fontSize: '24px' }}>Chessboard Territory</h1>
      <div>
        {loading ? (
          <div>Loading...</div>
        ) : user ? (
          <UserMenu user={user} onLogout={logout} />
        ) : (
          <button onClick={login}>Login with Lichess</button>
        )}
      </div>
    </header>
  );
};

export default Header;
