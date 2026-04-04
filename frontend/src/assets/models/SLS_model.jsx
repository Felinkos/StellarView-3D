import { useGLTF } from '@react-three/drei';

export function SLSModel(props) {
  const { scene } = useGLTF('/models/SLS.glb');
  scene.traverse((child) => {
    if (child.isMesh) child.castShadow = true;
  });
  return <primitive object={scene} dispose={null} {...props} />;
}