import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Zap, TrendingUp, BarChart3, Settings } from 'lucide-react';

interface MetricCard {
  id: string;
  label: string;
  value: string;
  unit: string;
  trend: number;
  color: string;
}

const METRICS: MetricCard[] = [
  {
    id: 'exploration',
    label: 'EXPLORATION INDEX',
    value: '7.2',
    unit: '/10',
    trend: 12,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'consistency',
    label: 'CONSISTENCY SCORE',
    value: '8.9',
    unit: '/10',
    trend: -3,
    color: 'from-magenta-500 to-pink-600',
  },
  {
    id: 'diversity',
    label: 'DIVERSITY METRIC',
    value: '42',
    unit: 'dimensions',
    trend: 8,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'engagement',
    label: 'ENGAGEMENT LEVEL',
    value: '6.5',
    unit: '/10',
    trend: 5,
    color: 'from-orange-500 to-red-600',
  },
];

export function RetroDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur border-b-4 border-cyan-500 pointer-events-auto"
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-magenta-500 border-2 border-white flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">CAPSULE OS</h1>
              <p className="text-cyan-400 text-xs tracking-widest">PERSONAL INTELLIGENCE NEXUS</p>
            </div>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-12 h-12 bg-white border-2 border-black text-black hover:bg-cyan-500 transition-all duration-200"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.div>

      {/* Left Sidebar - Metrics */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute left-0 top-24 bottom-0 w-80 bg-black/70 backdrop-blur border-r-4 border-magenta-500 p-6 overflow-y-auto pointer-events-auto space-y-4 hidden lg:block"
      >
        <h2 className="text-xl font-black text-white mb-6 border-b-2 border-magenta-500 pb-4">
          BEHAVIORAL METRICS
        </h2>

        {METRICS.map((metric) => (
          <motion.div
            key={metric.id}
            whileHover={{ scale: 1.02, x: 8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMetric(metric.id)}
            className={`p-4 border-2 cursor-pointer transition-all duration-200 ${
              selectedMetric === metric.id
                ? 'bg-gradient-to-r from-cyan-500 to-magenta-500 border-white'
                : 'bg-black/40 border-gray-700 hover:border-cyan-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-black text-xs tracking-widest text-white">{metric.label}</h3>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${selectedMetric === metric.id ? 'text-black' : 'text-white'}`}>
                {metric.value}
              </span>
              <span className={`text-xs ${selectedMetric === metric.id ? 'text-black' : 'text-gray-400'}`}>
                {metric.unit}
              </span>
            </div>
            <div className={`text-xs mt-2 ${metric.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metric.trend > 0 ? '+' : ''}{metric.trend}% from average
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Right Panel - Insight Capsule */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute right-0 top-24 bottom-0 w-96 bg-black/70 backdrop-blur border-l-4 border-green-500 p-8 overflow-y-auto pointer-events-auto hidden lg:flex flex-col"
      >
        <h2 className="text-2xl font-black text-white mb-4 border-b-2 border-green-500 pb-4">
          TODAY'S INSIGHT
        </h2>

        <div className="flex-1 space-y-6">
          <div>
            <p className="text-xs font-black text-green-400 mb-2">PERSONALITY SIGNATURE</p>
            <p className="text-2xl font-black text-white">ADAPTIVE EXPLORER</p>
          </div>

          <div>
            <p className="text-xs font-black text-cyan-400 mb-3">KEY INSIGHTS</p>
            <div className="space-y-2">
              {[
                'Multi-dimensional engagement patterns detected',
                'Consistency maintained across 4 data sources',
                'Peak exploration during evening hours',
              ].map((insight, i) => (
                <div key={i} className="flex gap-3 text-sm text-gray-300 bg-black/40 border-l-2 border-cyan-500 p-3">
                  <span className="text-cyan-500 font-black">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-black text-magenta-400 mb-2">TREND ANALYSIS</p>
            <p className="text-sm text-gray-300">
              Your behavioral complexity increased 23% week-over-week. Focus areas expanding into wellness and productivity.
            </p>
          </div>

          <div className="flex gap-2 mt-auto">
            <button className="flex-1 px-4 py-2 bg-white text-black font-black border-2 border-white hover:bg-cyan-500 hover:border-cyan-500 transition-all duration-200">
              SHARE
            </button>
            <button className="flex-1 px-4 py-2 bg-black border-2 border-white text-white font-black hover:bg-white hover:text-black transition-all duration-200">
              DETAILS
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bottom Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur border-t-4 border-cyan-500 p-6 pointer-events-auto"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button className="px-6 py-3 bg-cyan-500 text-black font-black border-2 border-black hover:shadow-[0_4px_0_0_#000] active:shadow-none active:translate-y-1 transition-all duration-200">
              SYNC DATA
            </button>
            <button className="px-6 py-3 bg-black border-2 border-white text-white font-black hover:bg-white hover:text-black transition-all duration-200">
              CONNECT SOURCE
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="text-gray-400 text-xs">LAST SYNC</p>
              <p className="text-white font-black">2024-12-28 14:32:15</p>
            </div>
            <button className="w-12 h-12 bg-white border-2 border-black text-black hover:bg-cyan-500 transition-all duration-200">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute top-24 left-0 right-0 bg-black border-2 border-cyan-500 p-4 pointer-events-auto md:hidden z-50"
        >
          <div className="space-y-2">
            {METRICS.map((metric) => (
              <motion.button
                key={metric.id}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left p-4 bg-black/40 border-2 border-gray-700 hover:border-cyan-500 text-white font-black text-sm transition-all duration-200"
              >
                {metric.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
