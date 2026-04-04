import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';

export default function Scene({ children }) {
  // позишин позиция
  const camSettings = {
    position: [0, 6, 28],
    fov: 58
  };

  return (
    <Canvas
      camera={camSettings}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}
      gl={{ antialias: true }}
    >
      {/* мягкий общий свет */}
      <ambientLight intensity={0.75} />

      {/* основной свет сверху-справа */}
      <pointLight 
        position={[12, 18, 12]} 
        intensity={1.6} 
        color="#ffffff" 
      />

      {/* слабый синий снизу-сзади*/}
      <pointLight 
        position={[-8, -12, -15]} 
        intensity={0.6} 
        color="#a5d8ff" 
      />

      {/* звёзды - фон космоса */}
      <Stars 
        radius={280}
        depth={70}
        count={14000}
        factor={6.5}
        saturation={0.1}
        fade
        speed={0.8}
      />

      {/* управление мышкой */}
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        dampingFactor={0.06}
        rotateSpeed={0.8}
        minDistance={8}
        maxDistance={60}
      />

      {/* фон космоса из drei */}
      <Environment preset="space" background />
      {children}
    </Canvas>
  );
}