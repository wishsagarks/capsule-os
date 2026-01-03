import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { Text } from '@react-three/drei';

export function CentralCore() {
  const coreRef = useRef<Group>(null);
  const innerSphereRef = useRef<Mesh>(null);
  const outerTorusRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      coreRef.current.rotation.y += 0.001;
    }

    if (innerSphereRef.current) {
      innerSphereRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.15
      );
    }

    if (outerTorusRef.current) {
      outerTorusRef.current.rotation.z += 0.02;
    }
  });

  return (
    <group position={[0, 3, 0]} ref={coreRef}>
      {/* Central Core Sphere */}
      <mesh ref={innerSphereRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial
          color="#00FFFF"
          emissive="#00FFFF"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Rotating Torus */}
      <mesh ref={outerTorusRef}>
        <torusGeometry args={[1.8, 0.15, 32, 100]} />
        <meshStandardMaterial
          color="#FF00FF"
          emissive="#FF00FF"
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Wireframe Icosahedron */}
      <mesh rotation={[0.5, 0.5, 0.5]}>
        <icosahedronGeometry args={[1.5, 2]} />
        <meshStandardMaterial
          color="#00FF00"
          emissive="#00FF00"
          emissiveIntensity={0.3}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Pulsing Outer Shell */}
      <PulsingShell />

      {/* Central Label */}
      <Text position={[0, 0, 0]} fontSize={0.6} color="#FFFFFF">
        INTELLIGENCE
      </Text>
      <Text position={[0, -0.7, 0]} fontSize={0.4} color="#00FFFF">
        NEXUS
      </Text>
    </group>
  );
}

function PulsingShell() {
  const shellRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (shellRef.current) {
      const scale = 2.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
      shellRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={shellRef}>
      <icosahedronGeometry args={[2.2, 1]} />
      <meshStandardMaterial
        color="#00FFFF"
        emissive="#00FFFF"
        emissiveIntensity={0.1}
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}
