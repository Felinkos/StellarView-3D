import { useGLTF } from '@react-three/drei';

export function EarthModel(props) {
  const { scene } = useGLTF('/models/Earth.glb');

  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        child.material.needsUpdate = true;
        child.material.roughness = 0.82;
        child.material.metalness = 0.08;
        
        console.log('Настроил материал для меша:', child.name);
      }
    }
  });

  return <primitive object={scene} dispose={null} {...props} />;
}