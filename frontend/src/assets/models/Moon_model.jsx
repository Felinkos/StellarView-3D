import { useGLTF } from '@react-three/drei';

export function MoonModel(props) {
  const { scene } = useGLTF('/models/Moon.glb');
  scene.traverse((child) => {
    if (child.isMesh) child.castShadow = true;
  });
  return <primitive object={scene} dispose={null} {...props} />;
}