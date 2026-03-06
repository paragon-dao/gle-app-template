import React from 'react';

/**
 * Simple key-value result display.
 */
export default function ResultView({ label, data }) {
  return (
    <div style={{
      marginTop: 12,
      padding: 12,
      background: '#1a1a2e',
      borderRadius: 8,
      border: '1px solid #333',
    }}>
      <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#4ade80', marginTop: 4 }}>
        {data}
      </div>
    </div>
  );
}
