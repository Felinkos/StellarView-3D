// Login.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ onLogin }) {
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const nav = useNavigate();

  const tryLogin = async (event) => {
    event.preventDefault();

    if (!login.trim() || !pass.trim()) {
      setErrMsg('Заполните оба поля');
      return;
    }

    setErrMsg('');
    setIsLoading(true);

    console.log('Пробуем войти как:', login);

    try {
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(login)}&password=${encodeURIComponent(pass)}`
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Неверный логин или пароль');
      }

      console.log('Успешный вход, токен получен');

      onLogin(result.access_token, login);

      nav('/editor');

    } catch (error) {
      console.log('Ошибка при входе:', error.message);
      setErrMsg(error.message || 'Не получилось войти... попробуйте ещё раз');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #000428, #001122)',
      color: '#f0f4ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '90px 15px 30px'
    }}>
      <div style={{
        background: 'rgba(25, 45, 110, 0.55)',
        borderRadius: '14px',
        padding: '45px 50px',
        width: '100%',
        maxWidth: '460px',
        border: '1px solid rgba(96, 165, 250, 0.45)',
        boxShadow: '0 8px 35px rgba(30, 58, 138, 0.6)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.6rem',
          marginBottom: '35px',
          color: '#b3e5fc'
        }}>
          Вход в систему
        </h1>

        <form onSubmit={tryLogin}>
          <input
            type="text"
            placeholder="Логин / Никнейм"
            value={login}
            onChange={e => setLogin(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '13px 16px',
              marginBottom: '18px',
              borderRadius: '10px',
              border: '1px solid #7ab8ff',
              background: 'rgba(255,255,255,0.07)',
              color: 'white',
              fontSize: '1.05rem',
              outline: 'none'
            }}
          />

          <input
            type="password"
            placeholder="Пароль"
            value={pass}
            onChange={e => setPass(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '13px 16px',
              marginBottom: '22px',
              borderRadius: '10px',
              border: '1px solid #7ab8ff',
              background: 'rgba(255,255,255,0.07)',
              color: 'white',
              fontSize: '1.05rem',
              outline: 'none'
            }}
          />

          {errMsg && (
            <p style={{
              color: '#ff8787',
              margin: '0 0 18px 0',
              fontSize: '0.98rem'
            }}>
              {errMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading ? '#555' : 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? 'Проверяем...' : 'Войти'}
          </button>
        </form>

        <p style={{
          marginTop: '24px',
          color: '#b3e5fc',
          fontSize: '1rem'
        }}>
          Ещё не зарегистрирован?{' '}
          <span
            onClick={() => nav('/register')}
            style={{
              color: '#60a5fa',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '500'
            }}
          >
            Создать аккаунт
          </span>
        </p>
      </div>
    </div>
  );
}