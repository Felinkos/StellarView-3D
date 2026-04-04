// Register.jsx
// Страница регистрации — почти зеркально Login, но с двумя шагами (reg + auto-login)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register({ onRegister }) {
  const nav = useNavigate();

  const [nick, setNick] = useState('');
  const [pass, setPass] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tryRegister = async (e) => {
    e.preventDefault();

    if (!nick.trim() || !pass.trim()) {
      setErrMsg('Оба поля обязательны');
      return;
    }

    setErrMsg('');
    setIsLoading(true);

    console.log('Пробуем зарегистрировать:', nick); // отладка

    try {
      // ─── Регистрация ───
      const regForm = new FormData();
      regForm.append('username', nick);
      regForm.append('password', pass);

      const regRes = await fetch('http://localhost:8000/register', {
        method: 'POST',
        body: regForm,
      });

      const regData = await regRes.json();

      if (!regRes.ok) {
        throw new Error(regData.detail || 'Не удалось зарегистрироваться');
      }

      // ─── Автоматический вход ───
      const loginBody = `username=${encodeURIComponent(nick)}&password=${encodeURIComponent(pass)}`;

      const loginRes = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: loginBody,
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loginData.detail || 'Не получилось войти после регистрации');
      }

      console.log('Регистрация и вход прошли, токен есть');

      onRegister(loginData.access_token, nick);
      nav('/editor');

    } catch (err) {
      console.log('Ошибка при регистрации:', err.message);
      setErrMsg(err.message || 'Что-то пошло не так...');
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
          Регистрация
        </h1>

        <form onSubmit={tryRegister}>
          <input
            type="text"
            placeholder="Логин / Никнейм"
            value={nick}
            onChange={e => setNick(e.target.value)}
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
            {isLoading ? 'Создаём...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p style={{
          marginTop: '24px',
          color: '#b3e5fc',
          fontSize: '1rem'
        }}>
          Уже есть аккаунт?{' '}
          <span
            onClick={() => nav('/login')}
            style={{
              color: '#60a5fa',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '500'
            }}
          >
            Войти
          </span>
        </p>
      </div>
    </div>
  );
}