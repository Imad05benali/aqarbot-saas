import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function DigitalGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create a custom shader material for the futuristic look
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#124E96', // AqarBot Blue
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
  }, []);

  const innerMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#21A041', // AqarBot Green
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Slow rotation
      meshRef.current.rotation.y += 0.001;
      meshRef.current.rotation.x += 0.0005;
      
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Subtle reaction to mouse position
      const targetX = (state.pointer.x * Math.PI) / 10;
      const targetY = (state.pointer.y * Math.PI) / 10;
      
      meshRef.current.rotation.y += 0.05 * (targetX - meshRef.current.rotation.y);
      meshRef.current.rotation.x += 0.05 * (targetY - meshRef.current.rotation.x);
    }
  });

  return (
    <group ref={meshRef}>
      <Sphere args={[2, 32, 32]}>
        <primitive object={material} attach="material" />
      </Sphere>
      {/* Inner sphere for more complex wireframe pattern */}
      <Sphere args={[1.9, 16, 16]}>
        <primitive object={innerMaterial} attach="material" />
      </Sphere>
      
      {/* Some floating particles around it */}
      <points>
        <sphereGeometry args={[3, 32, 32]} />
        <pointsMaterial color="#ffffff" size={0.02} transparent opacity={0.5} sizeAttenuation />
      </points>
    </group>
  );
}
