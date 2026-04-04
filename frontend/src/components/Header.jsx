import { Link } from 'react-router-dom';

export default function Header({ token, userEmail, onLogout }) {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      background: 'rgba(10, 15, 35, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(96, 165, 250, 0.3)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      color: 'white'
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#a5d8ff', fontSize: '1.8rem', fontWeight: 'bold' }}>
        StellarView 3D
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {token ? (
          <>
            <span style={{ color: '#60a5fa' }}></span>
            <button
              onClick={onLogout}
              style={{
                padding: '8px 20px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Выйти
            </button>
          </>
        ) : (
          <Link to="/login">
            <button style={{
              padding: '8px 20px',
              background: '#1e40af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Войти
            </button>
          </Link>
        )}
      </div>
    </header>
  );
}