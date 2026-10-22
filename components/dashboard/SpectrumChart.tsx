import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface EEGDataPoint {
  counter: number; // Incrementing counter to keep the X-axis moving forward endlessly
  time: string;
  Delta: number;
  Theta: number;
  Alpha: number;
  Beta: number;
  Gamma: number;
}

// 📊 Mock static list of numbers (acts as our core base pattern)
const STATIC_EEG_PATTERN = [
  { Delta: 1.2, Theta: -0.5, Alpha: 0.8, Beta: 0.2, Gamma: -0.1 },
  { Delta: 2.5, Theta: -1.2, Alpha: 1.5, Beta: -0.4, Gamma: 0.3 },
  { Delta: -0.8, Theta: -2.1, Alpha: 2.2, Beta: 0.9, Gamma: -0.5 },
  { Delta: 3.4, Theta: 0.5, Alpha: -1.1, Beta: -1.2, Gamma: 0.8 },
  { Delta: -6.5, Theta: -5.0, Alpha: -2.5, Beta: 1.5, Gamma: -1.0 }, 
  { Delta: -8.5, Theta: -6.5, Alpha: 1.0, Beta: -0.8, Gamma: 2.1 },
  { Delta: 4.0, Theta: 7.0, Alpha: 3.2, Beta: 2.5, Gamma: -1.8 },
  { Delta: 9.0, Theta: 2.1, Alpha: -0.5, Beta: -2.0, Gamma: 3.5 },
  { Delta: 1.9, Theta: -1.5, Alpha: 0.2, Beta: 0.7, Gamma: -0.4 },
  { Delta: -2.2, Theta: 0.8, Alpha: -1.4, Beta: -0.3, Gamma: 0.9 },
  { Delta: 0.5, Theta: 1.2, Alpha: 1.9, Beta: 1.1, Gamma: -1.2 },
  { Delta: 1.1, Theta: -0.9, Alpha: -0.4, Beta: -1.5, Gamma: 0.6 }
];

export default function EndlessEEGChart() {
  const [data, setData] = useState<EEGDataPoint[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamTickRef = useRef<number>(0);

  
useEffect(() => {
  if (!isStreaming) return;

  const interval = window.setInterval(() => {
    const currentTick = streamTickRef.current;

    const patternIndex =
      currentTick % STATIC_EEG_PATTERN.length;

    const nextPatternPoint =
      STATIC_EEG_PATTERN[patternIndex];

    const timeLabel =
      `${(currentTick * 0.25).toFixed(1)}s`;

    setData((prevData) => {
      const nextDataPoint: EEGDataPoint = {
        counter: currentTick,
        time: timeLabel,
        ...nextPatternPoint,
      };

      // Keep only the latest 30 points visible.
      return [...prevData, nextDataPoint].slice(-30);
    });

    streamTickRef.current += 1;
  }, 250);

  return () => window.clearInterval(interval);
}, [isStreaming]);


  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl mt-8">
      <div className="mb-6 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
            Live Radiation Spectrum
          </h2>
          {/* <p className="text-sm text-slate-400">Continuous horizontal sweep using static baseline arrays</p> */}
        </div>
        
<button
  type="button"
  onClick={() => setIsStreaming(true)}
  disabled={isStreaming}
  className={`flex items-center gap-2 rounded-full border px-4 py-2 transition-colors ${
    isStreaming
      ? "cursor-default border-emerald-800/50 bg-emerald-950/50 text-emerald-400"
      : "border-violet-600 bg-violet-600 text-white hover:bg-violet-700"
  }`}
>
  <span className="relative flex h-2 w-2">
    {isStreaming && (
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
    )}

    <span
      className={`relative inline-flex h-2 w-2 rounded-full ${
        isStreaming
          ? "bg-emerald-500"
          : "bg-white"
      }`}
    />
  </span>

  <span className="text-xs font-semibold tracking-wider">
    {isStreaming ? "live" : "stream"}
  </span>
</button>

      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {/* 🔑 Crucial Change: Using 'counter' as a unique identifier for the XAxis, but showing 'time' as the visible label */}
          <LineChart data={data} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
            <XAxis 
              dataKey="counter" 
              tickFormatter={(_, index) => data[index]?.time || ''} 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              domain={[-10, 10]} 
              dx={-5}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px' }}
              labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
              labelFormatter={(_, items) => items[0]?.payload?.time || ''}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '13px', paddingBottom: '20px' }}
            />
            
            <Line type="monotone" dataKey="Delta" stroke="#1d4ed8" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="Theta" stroke="#15803d" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="Alpha" stroke="#b45309" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="Beta" stroke="#b91c1c" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="Gamma" stroke="#7e22ce" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
