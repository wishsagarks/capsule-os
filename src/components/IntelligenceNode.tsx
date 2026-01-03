import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { Text } from '@react-three/drei';

interface IntelligenceNodeProps {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
}

export function IntelligenceNode({ id, label, position, color }: IntelligenceNodeProps) {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }

    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + (hovered ? 0.3 : 0) + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Core Sphere */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 1 : 0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Orbiting Ring */}
        <mesh rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}>
          <torusGeometry args={[1.3, 0.1, 16, 100]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Glow particles */}
        <ParticleRing color={color} intensity={hovered ? 1 : 0.5} />
      </group>

      {/* Label */}
      <Text position={[0, -1.8, 0]} fontSize={0.5} color={color} anchorY="top">
        {label}
      </Text>

      {/* Connection indicator */}
      {hovered && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.2}
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

function ParticleRing({ color, intensity }: { color: string; intensity: number }) {
  const particleRef = useRef<Group>(null);

  useFrame((state) => {
    if (particleRef.current) {
      particleRef.current.rotation.x += 0.005;
      particleRef.current.rotation.y += 0.008;
    }
  });

  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const x = Math.cos(angle) * 1.8;
    const z = Math.sin(angle) * 1.8;
    return { x, z, id: i };
  });

  return (
    <group ref={particleRef}>
      {particles.map((p) => (
        <mesh key={p.id} position={[p.x, 0, p.z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={intensity}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}
