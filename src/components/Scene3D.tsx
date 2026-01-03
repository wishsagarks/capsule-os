import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { IntelligenceNode } from './IntelligenceNode';
import { CentralCore } from './CentralCore';

const SOURCES = [
  { id: 'spotify', label: 'Spotify', angle: 0, color: '#1DB954' },
  { id: 'github', label: 'GitHub', angle: Math.PI * 0.4, color: '#00D9FF' },
  { id: 'youtube', label: 'YouTube', angle: Math.PI * 0.8, color: '#FF0000' },
  { id: 'reading', label: 'Reading', angle: Math.PI * 1.2, color: '#FF00FF' },
  { id: 'fitness', label: 'Fitness', angle: Math.PI * 1.6, color: '#00FF00' },
  { id: 'calendar', label: 'Calendar', angle: Math.PI * 2, color: '#FFD700' },
];

const RADIUS = 8;

export function Scene3D() {
  const groupRef = useRef<Group>(null);

  const nodePositions = useMemo(() => {
    return SOURCES.map((source) => {
      const x = Math.cos(source.angle) * RADIUS;
      const z = Math.sin(source.angle) * RADIUS;
      return { ...source, position: [x, 3, z] as [number, number, number] };
    });
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Intelligence Core */}
      <CentralCore />

      {/* Intelligence Source Nodes */}
      {nodePositions.map((node) => (
        <IntelligenceNode
          key={node.id}
          id={node.id}
          label={node.label}
          position={node.position}
          color={node.color}
        />
      ))}

      {/* Connecting Grid/Network Lines */}
      <NetworkGrid positions={nodePositions} />
    </group>
  );
}

function NetworkGrid({ positions }: any) {
  const lines = useMemo(() => {
    const center = new Vector3(0, 3, 0);
    return positions.map((pos: any) => (
      <line key={pos.id} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 3, 0, pos.position[0], pos.position[1], pos.position[2]])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={pos.color} transparent opacity={0.2} linewidth={1} />
      </line>
    ));
  }, [positions]);

  return <group>{lines}</group>;
}
