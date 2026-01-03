import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { Scene3D } from './Scene3D';

export function Canvas3D() {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <PerspectiveCamera makeDefault position={[0, 8, 15]} fov={45} />

      <color attach="background" args={['#000000']} />

      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        color="#00ffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-10, 10, -10]} intensity={0.6} color="#ff00ff" />

      <Suspense fallback={null}>
        <Scene3D />
        <Environment preset="night" />
      </Suspense>

      <OrbitControls
        makeDefault
        autoRotate
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI * 0.6}
        minDistance={10}
        maxDistance={50}
      />
    </Canvas>
  );
}
