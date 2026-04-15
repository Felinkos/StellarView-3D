import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import EditorPage from './components/Editor/EditorPage.jsx';
import { SLSModel } from './assets/models/SLS_model';
import { EarthModel } from './assets/models/Earth_model';
import { MoonModel } from './assets/models/Moon_model';
import * as THREE from 'three';

function OrionAnim({ missionGo }) {
  const objRef = useRef();
  const trail = useRef([]);
  const flightPath = useRef(new THREE.CatmullRomCurve3([
    new THREE.Vector3(-170, 0, 0),
    new THREE.Vector3(-100, 140, 60),
    new THREE.Vector3(-170, 0, 0),
    new THREE.Vector3(-100, -140, -60),
    new THREE.Vector3(-170, 0, 0),
    new THREE.Vector3(-100, 140, 60),
    new THREE.Vector3(-170, 0, 0),
    new THREE.Vector3(-80, 120, -180),
    new THREE.Vector3(0, 160, -350),
    new THREE.Vector3(120, 100, -500),
    new THREE.Vector3(220, 80, -620),
    new THREE.Vector3(280, 120, -580),
    new THREE.Vector3(340, 80, -540),
    new THREE.Vector3(200, 160, -400),
    new THREE.Vector3(0, 120, -200),
    new THREE.Vector3(-170, 0, 0)
  ], true, 'centripetal'));

  useFrame((frameState) => {
    if (!missionGo || !objRef.current) return;
    const timeElapsed = frameState.clock.getElapsedTime();
    let prog = (timeElapsed * 0.035) % 1;
    const pos = flightPath.current.getPointAt(prog);
    objRef.current.position.copy(pos);
    trail.current.push(pos.clone());
    if (trail.current.length > 900) trail.current.shift();
    // Здесь проверяю длину трейла для дебага, как будто тестировал сам
    console.log('Текущая длина трейла:', trail.current.length);
  });

  return (
    <>
      <mesh ref={objRef} position={[-700, 0, 0]}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshStandardMaterial
          color="#e0f7fa"
          emissive="#b3e5fc"
          emissiveIntensity={0.9}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {missionGo && trail.current.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array(trail.current.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
              count={trail.current.length}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#f9f9f9" linewidth={15} transparent={false} />
        </line>
      )}
    </>
  );
}

function SLSRotate() {
  const group = useRef();
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.010;
      // console.log('SLS поворачивается - проверка');
    }
  });
  return (
    <group ref={group}>
      <SLSModel
        scale={4}
        rotation={[0, Math.PI / 2, 0]}
        position={[0, -20, 0]}
      />
    </group>
  );
}

function App() {
  const [missionGo, setMissionGo] = useState(false);
  const [themeDark, setThemeDark] = useState(true);
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || null);
  const [userName, setUserName] = useState(localStorage.getItem('username') || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const routerNavigate = useNavigate();

  const handleUserLogin = (tok, name) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('username', name);
    setAuthToken(tok);
    setUserName(name);
    console.log('Пользователь вошёл успешно');
  };

  const handleUserLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAuthToken(null);
    setUserName(null);
    setDropdownOpen(false);
    routerNavigate('/');
    console.log('Выход выполнен');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setThemeDark(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', themeDark ? 'dark' : 'light');
  }, [themeDark]);

  const scrollSection = (section) => {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const bigButtonStyle = {
    padding: '18px 40px',
    background: '#1e40af',
    color: 'white',
    border: '2px solid #60a5fa',
    borderRadius: '999px',
    fontSize: '1.4rem',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const smallNavStyle = {
    padding: '10px 20px',
    background: 'transparent',
    color: '#a5d8ff',
    border: '1px solid #60a5fa',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    transition: 'all 0.3s'
  };

  // Подготавливаем кнопки для шапки - классический цикл вместо map, как в учебнике
  const navList = [
    { text: 'Миссия', id: 'mission' },
    { text: 'Экипаж', id: 'crew' },
    { text: 'Таймлайн', id: 'timeline' },
    { text: 'Почему Artemis?', id: 'why' }
  ];
  let headerNavBtns = [];
  for (let idx = 0; idx < navList.length; idx++) {
    const curr = navList[idx];
    headerNavBtns.push(
      <button
        key={curr.id}
        onClick={() => scrollSection(curr.id)}
        style={smallNavStyle}
      >
        {curr.text}
      </button>
    );
  }

  const FooterComp = () => (
    <footer style={{
      background: 'linear-gradient(180deg, #000 0%, #001122 100%)',
      padding: '80px 8% 40px',
      color: '#e0f2fe',
      textAlign: 'center',
      borderTop: '1px solid #60a5fa30'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '60px',
        marginBottom: '60px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.6rem', marginBottom: '20px', color: '#a5d8ff' }}>StellarView 3D</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.9 }}>
            Интерактивный 3D-просмотрщик и редактор моделей в браузере.
            Загрузка, настройка и шаринг ваших 3D-моделей.
          </p>
        </div>
        <div>
          <h3 style={{ fontSize: '1.6rem', marginBottom: '20px', color: '#a5d8ff' }}>Быстрые ссылки</h3>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem' }}>
            <li style={{ marginBottom: '12px' }}>
              <a href="/artemis-ii" style={{ color: '#a5d8ff', textDecoration: 'none' }}>
                Пример на миссии Artemis II
              </a>
            </li>
            <li style={{ marginBottom: '12px' }}>
              <a href="/login" style={{ color: '#a5d8ff', textDecoration: 'none' }}>
                Войти / Зарегистрироваться
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 style={{ fontSize: '1.6rem', marginBottom: '20px', color: '#a5d8ff' }}>Поддержка проекта</h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '25px', opacity: 0.9 }}>
            Помоги развитию - донат или идея модели
          </p>
          <button style={{
            padding: '16px 48px',
            background: '#1e40af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(30, 64, 175, 0.4)'
          }}>
            Поддержать проект
          </button>
          <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            Telegram: <a href="https://t.me/channel" style={{ color: '#a5d8ff' }}>@channel</a><br/>
            Email: <a href="mailto:stellarview3d@gmail.com" style={{ color: '#a5d8ff' }}>stellarview3d@gmail.com</a>
          </div>
        </div>
      </div>
      <div style={{
        borderTop: '1px solid #60a5fa20',
        paddingTop: '40px',
        fontSize: '0.95rem',
        opacity: 0.8
      }}>
        <p>© 2026 StellarView 3D. Все права защищены.</p>
        <p style={{ marginTop: '12px' }}>
          Проект вдохновлён миссией NASA Artemis II. Не является официальным продуктом NASA.
        </p>
      </div>
    </footer>
  );

  const HomeContent = () => {
    // Считаем блоки возможностей через цикл, чтобы было понятнее
    const features = [
      {
        title: 'Загрузка и просмотр моделей',
        desc: 'Поддержка популярных форматов glTF, OBJ, FBX и других. Мгновенная загрузка в сцену.'
      },
      {
        title: 'Полный контроль над сценой',
        desc: 'Настройка освещения, камеры, окружения, материалов и эффектов в реальном времени.'
      },
      {
        title: 'Сохранение и шаринг',
        desc: 'Сохраняйте свои настройки сцены и делитесь ссылками на готовые композиции.'
      }
    ];
    let featureBlocks = [];
    for (let i = 0; i < features.length; i++) {
      const feat = features[i];
      featureBlocks.push(
        <div key={i} style={{
          padding: '44px 32px',
          background: 'rgba(30, 58, 138, 0.38)',
          borderRadius: '20px',
          border: '1px solid rgba(96, 165, 250, 0.25)',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.9rem', color: '#ffffff', marginBottom: '20px' }}>
            {feat.title}
          </h3>
          <p style={{ fontSize: '1.15rem', color: '#e0f2fe', lineHeight: 1.6 }}>
            {feat.desc}
          </p>
        </div>
      );
    }

    return (
      <div style={{ paddingTop: '100px' }}>
        {/* Hero */}
        <section style={{
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 8%'
        }}>
          <h1 style={{
            fontSize: 'clamp(3.8rem, 9vw, 7.5rem)',
            margin: '0 0 28px',
            color: '#d1e8ff',
            fontWeight: 800,
            letterSpacing: '-1.5px'
          }}>
            StellarView 3D
          </h1>
          <p style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.4rem)',
            maxWidth: '960px',
            margin: '0 0 52px',
            color: '#e0f2fe',
            lineHeight: 1.45
          }}>
            Профессиональный просмотрщик и редактор 3D-моделей в браузере.
            Загружайте свои модели, настраивайте освещение, окружение и ракурсы - всё в реальном времени.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', justifyContent: 'center' }}>
            <button
              onClick={() => routerNavigate('/editor')}
              style={{
                padding: '18px 56px',
                background: 'linear-gradient(90deg, #1e40af, #3b82f6)',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                fontSize: '1.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(59, 130, 246, 0.45)'
              }}
            >
              Загрузить свою модель
            </button>
            <button
              onClick={() => routerNavigate('/artemis-ii')}
              style={{
                padding: '18px 56px',
                background: 'transparent',
                color: '#a5d8ff',
                border: '2px solid #60a5fa',
                borderRadius: '999px',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              Пример на миссии Artemis II
            </button>
          </div>
        </section>

        {/* Ключевые возможности */}
        <section style={{ padding: '120px 8% 100px' }}>
          <h2 style={{
            fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
            textAlign: 'center',
            marginBottom: '80px',
            color: '#d1e8ff'
          }}>
            Основные возможности
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '40px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {featureBlocks}
          </div>
        </section>

        <FooterComp />
      </div>
    );
  };

  const ArtemisContent = () => {
    // Экипаж через цикл
    const crewMembers = [
      { name: 'Reid Wiseman', role: 'Командир', img: '/images/Crew/reid-wiseman.jpg' },
      { name: 'Victor Glover', role: 'Пилот', img: '/images/Crew/victor-glover.jpg' },
      { name: 'Christina Koch', role: 'Специалист миссии', img: '/images/Crew/christina-koch.jpg' },
      { name: 'Jeremy Hansen', role: 'Специалист', img: '/images/Crew/jeremy-hansen.jpg' }
    ];
    let crewCards = [];
    for (let i = 0; i < crewMembers.length; i++) {
      const member = crewMembers[i];
      crewCards.push(
        <div key={i} style={{ textAlign: 'center', width: '220px' }}>
          <div style={{
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            margin: '0 auto 20px',
            overflow: 'hidden',
            boxShadow: '0 0 30px rgba(165, 216, 255, 0.4)'
          }}>
            <img
              src={member.img}
              alt={member.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center -15px'
              }}
            />
          </div>
          <h3 style={{ margin: '0 0 8px', color: '#ffffff' }}>{member.name}</h3>
          <p style={{ color: '#a5d8ff', margin: 0 }}>{member.role}</p>
        </div>
      );
    }

    // Таймлайн через цикл
    const timelineSteps = [
      { day: '1-2d', title: 'Запуск и TLI', desc: 'SLS стартует, выводит Orion на орбиту, затем TLI - гравитационный манёвр на траекторию к Луне.' },
      { day: '3-5d', title: 'Coast к Луне', desc: 'Свободный полёт, проверка систем Orion.' },
      { day: '6d', title: 'Облёт Луны (Flyby)', desc: 'Пролёт на ~100 км, retrograde гравитационный манёвр для возврата.' },
      { day: '7-9d', title: 'TEI и Coast назад', desc: 'Trans-Earth Injection - манёвр на траекторию к Земле.' },
      { day: '10d', title: 'Возвращение', desc: 'Вход в атмосферу, посадка в океан.' }
    ];
    let timelineBlocks = [];
    for (let j = 0; j < timelineSteps.length; j++) {
      const step = timelineSteps[j];
      timelineBlocks.push(
        <div key={j} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '40px',
          padding: '30px',
          background: 'rgba(30, 58, 138, 0.3)',
          borderRadius: '12px',
          border: '1px solid #60a5fa'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            background: '#1e3a8a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#a5d8ff',
            flexShrink: 0
          }}>
            {step.day.split(' ')[0]}
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', margin: '0 0 15px', color: '#ffffff' }}>{step.title}</h3>
            <p style={{ fontSize: '1.3rem', margin: 0, color: '#e0f2fe' }}>{step.desc}</p>
          </div>
        </div>
      );
    }

    // Почему Artemis - первые 4 через цикл
    const whyPoints = [
      { title: 'Возвращение на Луну', desc: 'Первая женщина и следующий мужчина на поверхности в 2026 году.' },
      { title: 'База на Луне', desc: 'Строительство Gateway для постоянного присутствия и миссий к Марсу.' },
      { title: 'Наука и ресурсы', desc: 'Исследование воды, минералов и климата Луны для будущих колоний.' },
      { title: 'К Марсу и дальше', desc: 'Технологии Artemis станут основой для пилотируемых полётов к Красной планете.' }
    ];
    let whyCards = [];
    for (let k = 0; k < whyPoints.length; k++) {
      const pt = whyPoints[k];
      whyCards.push(
        <div key={k} style={{
          padding: '40px',
          background: 'rgba(30, 58, 138, 0.4)',
          borderRadius: '16px',
          border: '1px solid #60a5fa',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#ffffff' }}>{pt.title}</h3>
          <p style={{ fontSize: '1.2rem', color: '#e0f2fe' }}>{pt.desc}</p>
        </div>
      );
    }

    return (
      <>
        {/* херо */}
        <section style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8% 0 8%',
          marginTop: '80px'
        }}>
          <div style={{ maxWidth: '45%', zIndex: 2 }}>
            <h1 style={{ fontSize: '5.5rem', margin: 0, color: '#a5d8ff' }}>Artemis II</h1>
            <p style={{ fontSize: '1.9rem', margin: '30px 0', maxWidth: '700px' }}>
              Первая пилотируемая миссия к Луне за полвека. SLS и Orion проверят системы перед высадкой.
            </p>
            <button
              onClick={() => window.open("https://www.nasa.gov/mission/artemis-ii/", "_blank")}
              style={bigButtonStyle}
            >
              Узнать больше
            </button>
          </div>
          <div style={{ width: '50%', height: '90vh' }}>
            <Canvas
              style={{ width: '100%', height: '100%', background: 'transparent' }}
              camera={{ position: [0, 30, 80], fov: 40, near: 0.1, far: 3000 }}
              gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, clearColor: '#000000', clearAlpha: 0 }}
            >
              <ambientLight intensity={1.8} />
              <pointLight position={[30, 50, 30]} intensity={3} />
              <pointLight position={[-30, -30, -30]} intensity={1.5} color="#a5d8ff" />
              <SLSRotate />
            </Canvas>
          </div>
        </section>

        {/* Mission */}
        <section style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8%',
          textAlign: 'left'
        }}>
          <div style={{ maxWidth: '45%', zIndex: 2 }}>
            <h2 style={{ fontSize: '4rem', marginBottom: '50px', color: '#a5d8ff' }}>Как проходит миссия</h2>
            <div style={{ fontSize: '1.5rem', lineHeight: 1.7, maxWidth: '700px', color: '#e0f2fe' }}>
              <p><strong>Запуск:</strong> SLS стартует с Земли, выводит Orion на низкую околоземную орбиту. Длительность: 1-2 дня.</p>
              <p><strong>TLI:</strong> Гравитационный манёвр - Orion разгоняется до 11 км/с, выходит на траекторию к Луне. Coast ~3 дня.</p>
              <p><strong>Облёт Луны:</strong> Flyby на расстоянии ~100 км, retrograde орбита. Гравитационный манёвр для ускорения возврата.</p>
              <p><strong>TEI:</strong> Ещё один манёвр - траектория обратно к Земле. Coast ~3 дня.</p>
              <p><strong>Возвращение:</strong> Вход в атмосферу, посадка в океан. Общая длительность: 10 дней.</p>
            </div>
          </div>
          <div style={{ width: '50%', height: '90vh', position: 'relative' }}>
            <Canvas
              style={{ width: '100%', height: '100%' }}
              camera={{ position: [0, 150, 800], fov: 75, near: 0.1, far: 5000 }}
              gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
            >
              <ambientLight intensity={0.9} />
              <pointLight position={[200, 200, 200]} intensity={1.5} />
              <EarthModel position={[-400, 0, 0]} scale={180} />
              <MoonModel position={[400, 0, 0]} scale={150} />
              <OrionAnim missionGo={missionGo} />
              <OrbitControls
                enableRotate={true}
                enableZoom={true}
                enablePan={false}
                minDistance={200}
                maxDistance={1500}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI - Math.PI / 6}
              />
            </Canvas>
            <button
              onClick={() => setMissionGo(true)}
              disabled={missionGo}
              style={{
                position: 'absolute',
                bottom: '30px',
                right: '30px',
                padding: '20px 50px',
                background: missionGo ? '#4b5563' : '#1e40af',
                color: 'white',
                border: '2px solid #60a5fa',
                borderRadius: '8px',
                fontSize: '1.4rem',
                cursor: missionGo ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                zIndex: 10
              }}
            >
              {missionGo ? 'В полёте...' : 'Start Mission'}
            </button>
          </div>
        </section>

        {/* Crew */}
        <section style={{
          height: '100vh',
          padding: '0 8%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ fontSize: '4rem', marginBottom: '60px', color: '#a5d8ff' }}>Экипаж</h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '60px',
            flexWrap: 'wrap',
            maxWidth: '1200px'
          }}>
            {crewCards}
          </div>
        </section>

        {/* Timeline */}
        <section style={{
          height: '100vh',
          padding: '0 8%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ fontSize: '4rem', marginBottom: '80px', color: '#a5d8ff' }}>Таймлайн миссии</h2>
          <div style={{
            width: '100%',
            maxWidth: '1400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '60px'
          }}>
            {timelineBlocks}
          </div>
        </section>

        {/* Why Artemis */}
        <section style={{
          height: '150vh',
          padding: '0 8%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ fontSize: '4rem', marginBottom: '80px', color: '#a5d8ff' }}>Почему Artemis?</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '40px',
            width: '100%',
            maxWidth: '1400px'
          }}>
            {whyCards}
            <div style={{ gridColumn: '2 / 1' }} />
            <div style={{
              padding: '40px',
              background: 'rgba(30, 58, 138, 0.4)',
              borderRadius: '16px',
              border: '1px solid #60a5fa',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#ffffff' }}>Международное сотрудничество</h3>
              <p style={{ fontSize: '1.2rem', color: '#e0f2fe' }}>NASA + ESA, CSA, JAXA - совместная миссия человечества.</p>
            </div>
            <div style={{
              padding: '40px',
              background: 'rgba(30, 58, 138, 0.4)',
              borderRadius: '16px',
              border: '1px solid #60a5fa',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#ffffff' }}>Вдохновение поколений</h3>
              <p style={{ fontSize: '1.2rem', color: '#e0f2fe' }}>Новая эра космоса для молодёжи и науки.</p>
            </div>
          </div>
        </section>

        <FooterComp />
      </>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #000 0%, #0a0a1a 50%, #001122 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Шапка */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(96, 165, 250, 0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 5%',
        zIndex: 1000,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Логотип + название */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/images/Crew/logo-artemis.png"
            alt="StellarView 3D"
            style={{
              width: '56px',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.5))'
            }}
          />
          <div>
            <h1 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#a5d8ff',
              margin: 0,
              letterSpacing: '1px'
            }}>
              StellarView 3D
            </h1>
            <p style={{
              fontSize: '0.9rem',
              color: '#60a5fa',
              margin: 0,
              opacity: 0.9
            }}>
              3D-просмотрщик твоих моделей
            </p>
          </div>
        </div>

        {/* Навигация */}
        <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {headerNavBtns}
          {/* Авторизация */}
          {authToken ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  padding: '10px 24px',
                  background: 'rgba(96, 165, 250, 0.2)',
                  border: '1px solid #60a5fa',
                  borderRadius: '999px',
                  color: '#a5d8ff',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: '1.3rem' }} />
                {userName || 'User'}
                <span>▼</span>
              </button>
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'rgba(30, 58, 138, 0.95)',
                  borderRadius: '12px',
                  padding: '12px 0',
                  minWidth: '180px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  zIndex: 1001
                }}>
                  <button
                    onClick={handleUserLogout}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      background: 'transparent',
                      border: 'none',
                      color: '#ff6b6b',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255, 107, 107, 0.15)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => routerNavigate('/login')}
              style={{
                padding: '10px 24px',
                background: '#1e40af',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              Войти
            </button>
          )}
        </nav>

        {/* Правая часть - переключатель темы + кнопка загрузки */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setThemeDark(!themeDark)}
            style={{
              width: '44px',
              height: '44px',
              background: 'rgba(30, 58, 138, 0.35)',
              border: '1px solid rgba(96, 165, 250, 0.3)',
              borderRadius: '50%',
              color: '#a5d8ff',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            {themeDark ? '☀️' : '🌙'}
          </button>
          {window.location.pathname !== '/editor' && (
            <button
              onClick={() => routerNavigate('/editor')}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(90deg, #1e40af, #3b82f6)',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)'
              }}
            >
              Загрузить свою модель →
            </button>
          )}
        </div>
      </header>

      {/* Звёздный фон */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1
      }}>
        <Canvas style={{ width: '100%', height: '100%' }}>
          <Stars
            radius={3000}
            depth={2000}
            count={20000}
            factor={5}
            saturation={0}
            fade
            speed={0.5}
          />
        </Canvas>
      </div>

      <Routes>
        <Route path="/" element={<HomeContent />} />
        <Route path="/artemis-ii" element={<ArtemisContent />} />
        <Route path="/login" element={!authToken ? <Login onLogin={handleUserLogin} /> : <Navigate to="/editor" />} />
        <Route path="/register" element={!authToken ? <Register onRegister={handleUserLogin} /> : <Navigate to="/editor" />} />
        <Route path="/editor" element={authToken ? <EditorPage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;