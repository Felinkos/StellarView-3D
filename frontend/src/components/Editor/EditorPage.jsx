import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Stars } from '@react-three/drei';
import * as THREE from 'three';
import ModelLoader from './ModelLoader';

export default function EditorPage() {
  const [modelUrl, setModelUrl] = useState(null);
  const [bgColor, setBgColor] = useState('#000000');
  const [lightPower, setLightPower] = useState(1.0);
  const [ambientPower, setAmbientPower] = useState(0.8);
  const [panelOpen, setPanelOpen] = useState(true);
  const [canDrag, setCanDrag] = useState(false);

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      background: bgColor,
      paddingTop: '100px'
    }}>
      <Canvas
        shadows
        camera={{ position: [0, 4, 15], fov: 50 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={[bgColor]} />

        <ambientLight intensity={ambientPower} />
        <pointLight position={[10, 10, 10]} intensity={lightPower * 1.5} castShadow />
        <directionalLight position={[5, 10, 5]} intensity={lightPower * 1.2} castShadow />
        <directionalLight position={[-8, 8, -8]} intensity={lightPower * 0.8} color="#e0f0ff" />
        <hemisphereLight intensity={0.7} skyColor="#88aaff" groundColor="#444466" />

        <Stars radius={300} depth={60} count={20000} factor={4} saturation={0} fade speed={0.5} />
        <gridHelper args={[60, 60, '#1a1a2e', '#0a0a14']} position={[0, -0.01, 0]} />

        {modelUrl && <MovableModel url={modelUrl} dragMode={canDrag} />}

        <OrbitControls makeDefault enablePan={false} />
      </Canvas>

      {/* панель справа */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: panelOpen ? 0 : '-380px',
        width: '380px',
        height: '100%',
        background: 'rgba(10, 15, 35, 0.96)',
        backdropFilter: 'blur(14px)',
        borderLeft: '1px solid rgba(96, 165, 250, 0.25)',
        color: 'white',
        transition: 'right 0.4s ease',
        zIndex: 999,
        overflowY: 'auto',
        padding: '110px 24px 80px 24px'
      }}>
        <button
          onClick={() => setPanelOpen(false)}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '44px',
            height: '44px',
            background: 'rgba(96, 165, 250, 0.3)',
            border: '2px solid #60a5fa',
            borderRadius: '50%',
            color: '#d1e8ff',
            fontSize: '1.4rem',
            cursor: 'pointer'
          }}
        >
          →
        </button>

        <h3 style={{ marginBottom: '24px', color: '#a5d8ff' }}>Настройки сцены</h3>

        <ModelLoader onModelLoad={setModelUrl} />

        <label style={{ display: 'block', margin: '24px 0' }}>
          Цвет фона:
          <input 
            type="color" 
            value={bgColor} 
            onChange={e => setBgColor(e.target.value)} 
            style={{ width: '100%', height: '40px', marginTop: '8px' }} 
          />
        </label>

        <label style={{ display: 'block', margin: '24px 0' }}>
          Яркость света: {lightPower.toFixed(1)}
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={lightPower}
            onChange={e => setLightPower(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>

        <label style={{ display: 'block', margin: '24px 0' }}>
          Фоновый свет: {ambientPower.toFixed(2)}
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={ambientPower}
            onChange={e => setAmbientPower(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </label>

        <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(30, 58, 138, 0.3)', borderRadius: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem' }}>
            <input
              type="checkbox"
              checked={canDrag}
              onChange={e => setCanDrag(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
            Режим перемещения (левая кнопка мыши)
          </label>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '8px' }}>
            Включите и зажмите левую кнопку на модели
          </p>
        </div>
      </div>

      {!panelOpen && (
        <button
          onClick={() => setPanelOpen(true)}
          style={{
            position: 'absolute',
            top: '50%',
            right: '20px',
            transform: 'translateY(-50%)',
            width: '48px',
            height: '48px',
            background: 'rgba(96, 165, 250, 0.3)',
            border: '2px solid #60a5fa',
            borderRadius: '50%',
            color: 'white',
            fontSize: '1.6rem',
            cursor: 'pointer',
            zIndex: 999
          }}
        >
          ←
        </button>
      )}
    </div>
  );
}

function MovableModel({ url, dragMode }) {
  const { scene } = useGLTF(url);
  const { camera, gl } = useThree();
  const modelRef = useRef();
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!scene) return;

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length() || 1;

    const scale = 8 / size;
    scene.scale.setScalar(scale);
    scene.position.sub(center.multiplyScalar(scale));
    scene.position.y = 0.2;

    camera.position.set(0, size * 0.5, size * 2.3);
    camera.lookAt(0, 0, 0);

    console.log('Модель загружена, масштаб:', scale.toFixed(2)); // проверяю сам
  }, [scene, camera]);

  useFrame(() => {
    if (!modelRef.current || !dragMode) return;

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        gl.domElement.style.cursor = 'grabbing';
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      gl.domElement.style.cursor = 'default';
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;

      const dx = (e.clientX - lastMouse.current.x) * 0.02;
      const dy = (e.clientY - lastMouse.current.y) * 0.02;

      modelRef.current.position.x += dx;
      modelRef.current.position.y -= dy;

      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    gl.domElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
    };
  });

  return <primitive ref={modelRef} object={scene} dispose={null} />;
}