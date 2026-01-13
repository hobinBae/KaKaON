import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, color, speed, rotationSpeed, geometry: GeometryTag, args }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    // Basic rotation
    meshRef.current.rotation.x += rotationSpeed * 0.01;
    meshRef.current.rotation.y += rotationSpeed * 0.01;
    
    // Mouse interaction effect
    const mouseX = state.pointer.x;
    const mouseY = state.pointer.y;
    
    meshRef.current.position.x += (mouseX * 0.5 - meshRef.current.position.x + position[0]) * 0.05;
    meshRef.current.position.y += (mouseY * 0.5 - meshRef.current.position.y + position[1]) * 0.05;
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <GeometryTag args={args} />
        <meshStandardMaterial 
            color={color} 
            roughness={0.3} 
            metalness={0.1}
            transparent
            opacity={0.8}
        />
      </mesh>
    </Float>
  );
}

export default function HeroBackground3D() {
  return (
    <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#FFDB58] to-[#FFFFFF]">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 40 }}
        onCreated={(state) => state.camera.lookAt(0, 0, 0)}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FEE500" />
        
        <FloatingShape 
          position={[-5, 3, 0]} 
          color="#FEE500" 
          speed={2} 
          rotationSpeed={0.3} 
          geometry="icosahedronGeometry"
          args={[1, 0]}
        />
        <FloatingShape 
          position={[5.5, -2, -3]} 
          color="#3C1E1E" 
          speed={3} 
          rotationSpeed={0.5} 
          geometry="torusGeometry"
          args={[0.8, 0.3, 16, 32]}
        />
        <FloatingShape 
          position={[-14, -1, -8]} 
          color="#3C1E1E" 
          speed={3} 
          rotationSpeed={0.3} 
          geometry="torusGeometry"
          args={[0.6, 0.2, 5, 10]}
        />
        <FloatingShape 
          position={[3, 4, -5]} 
          color="#ffffff" 
          speed={1.5} 
          rotationSpeed={0.6} 
          geometry="boxGeometry"
          args={[1.2, 1.2, 1.2]}
        />
        <FloatingShape 
          position={[0, 0, -8]} 
          color="#FEE500" 
          speed={2} 
          rotationSpeed={0.1} 
          geometry="octahedronGeometry"
          args={[1.2, 0]}
        />
        <FloatingShape 
          position={[-6, -3, -4]} 
          color="#C85A17" 
          speed={1} 
          rotationSpeed={0.8} 
          geometry="sphereGeometry"
          args={[1, 32, 32]}
        />
        <FloatingShape 
          position={[6, 1, 2]} 
          color="#C85A17" 
          speed={0.5} 
          rotationSpeed={0.5} 
          geometry="boxGeometry"
          args={[0.3, 0.8, 1.5]}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
