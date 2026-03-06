import React, { useRef, useEffect } from 'react';

/**
 * Simple waveform visualization of captured samples.
 * Replace with whatever visualization fits your app.
 */
export default function SignalView({ samples }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || samples.length === 0) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    // Draw waveform
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 1;
    ctx.beginPath();

    const step = Math.max(1, Math.floor(samples.length / w));
    for (let i = 0; i < w; i++) {
      const idx = Math.min(i * step, samples.length - 1);
      const val = samples[idx];
      const y = h / 2 + val * h * 0.4;
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();
  }, [samples]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={80}
      style={{ width: '100%', height: 80, borderRadius: 8, marginTop: 8 }}
    />
  );
}
