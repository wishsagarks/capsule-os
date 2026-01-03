import { Suspense } from 'react';
import { Canvas3D } from './Canvas3D';
import { RetroDashboard } from './RetroDashboard';

export function InteractiveDashboard() {
  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* 3D Canvas Background */}
      <Suspense
        fallback={
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-cyan-500 font-black text-xl tracking-widest">
              INITIALIZING 3D INTELLIGENCE NEXUS...
            </div>
          </div>
        }
      >
        <Canvas3D />
      </Suspense>

      {/* Retro UI Overlay */}
      <RetroDashboard />

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-repeat opacity-10"
          style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.05) 25%, rgba(0, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent)',
            backgroundSize: '100% 4px',
            animation: 'scanlines 8s linear infinite',
          }}
        />
      </div>

      {/* Corner Neon Glitch Effect */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="text-cyan-500 font-black text-xs tracking-widest opacity-70">
          &gt; CONNECTED
        </div>
      </div>

      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="text-magenta-500 font-black text-xs tracking-widest opacity-70">
          LIVE_ANALYSIS
        </div>
      </div>

      <style>{`
        @keyframes scanlines {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(10px);
          }
        }

        @keyframes flicker {
          0% { opacity: 0.97; }
          5% { opacity: 0.9; }
          10% { opacity: 0.99; }
          15% { opacity: 0.87; }
          20% { opacity: 1; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
