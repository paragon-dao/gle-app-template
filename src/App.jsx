import React, { useState } from 'react';
import { useSensor } from './hooks/useSensor';
import { useBagle } from './hooks/useBagle';
import SignalView from './components/SignalView';
import ResultView from './components/ResultView';

/**
 * GLE App Template
 *
 * This is your starting point. Replace the sensor, the UI,
 * and the analysis — the GLE encoding stays the same.
 *
 * The pattern:
 *   1. Capture a signal (any phone sensor)
 *   2. Encode it (128 coefficients via BAGLE API or local DCT)
 *   3. Analyze it (compare, trend, classify)
 *   4. Show the result
 */
export default function App() {
  const { isRecording, samples, startRecording, stopRecording } = useSensor();
  const { encoding, similarity, isEncoding, encode, compare } = useBagle();
  const [baseline, setBaseline] = useState(null);

  const handleEncode = async () => {
    if (samples.length === 0) return;
    const result = await encode(samples);
    if (result && !baseline) {
      setBaseline(result.encoding);
    }
  };

  const handleCompare = async () => {
    if (encoding && baseline) {
      await compare(encoding, baseline);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
          My GLE App
        </h1>
        <p style={{ fontSize: 14, color: '#888', marginTop: 8 }}>
          Capture any signal. Encode to 128 coefficients. Analyze.
        </p>
      </header>

      {/* Step 1: Capture */}
      <section style={cardStyle}>
        <h2 style={labelStyle}>1. Capture Signal</h2>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            ...buttonStyle,
            background: isRecording ? '#dc2626' : '#16a34a',
          }}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {samples.length > 0 && (
          <SignalView samples={samples} />
        )}
        <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
          {samples.length} samples captured
        </p>
      </section>

      {/* Step 2: Encode */}
      <section style={cardStyle}>
        <h2 style={labelStyle}>2. Encode (GLE)</h2>
        <button
          onClick={handleEncode}
          disabled={samples.length === 0 || isEncoding}
          style={{
            ...buttonStyle,
            background: '#2563eb',
            opacity: samples.length === 0 ? 0.5 : 1,
          }}
        >
          {isEncoding ? 'Encoding...' : 'Encode → 128 Coefficients'}
        </button>
        {encoding && (
          <ResultView
            label="Encoding"
            data={`${encoding.length} coefficients (${encoding.length * 4} bytes)`}
          />
        )}
      </section>

      {/* Step 3: Compare */}
      <section style={cardStyle}>
        <h2 style={labelStyle}>3. Compare</h2>
        {baseline ? (
          <>
            <p style={{ fontSize: 12, color: '#4ade80', marginBottom: 8 }}>
              Baseline set. Record again and compare.
            </p>
            <button
              onClick={handleCompare}
              disabled={!encoding}
              style={{
                ...buttonStyle,
                background: '#7c3aed',
                opacity: !encoding ? 0.5 : 1,
              }}
            >
              Compare to Baseline
            </button>
          </>
        ) : (
          <p style={{ fontSize: 12, color: '#666' }}>
            Encode a signal first to set your baseline.
          </p>
        )}
        {similarity !== null && (
          <ResultView
            label="Similarity"
            data={`${(similarity.similarity * 100).toFixed(1)}%`}
          />
        )}
      </section>

      <footer style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: '#444' }}>
        Built on ParagonDAO Network &middot; GLE Encoder
      </footer>
    </div>
  );
}

const cardStyle = {
  background: '#141414',
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
  border: '1px solid #222',
};

const labelStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#aaa',
  marginBottom: 12,
  textTransform: 'uppercase',
  letterSpacing: 1,
};

const buttonStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 8,
  border: 'none',
  color: '#fff',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
};
