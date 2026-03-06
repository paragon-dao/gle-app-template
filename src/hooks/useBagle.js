import { useState, useCallback } from 'react';

const BAGLE_API = 'https://bagle-api.fly.dev';

/**
 * Hook for encoding signals and comparing encodings via BAGLE API.
 *
 * Two options:
 *   1. API encoding (this hook) — send samples to BAGLE API, get 128 coefficients back
 *   2. Local encoding — use gleEncodeSignal() from @paragon-dao/bagle-sdk for offline
 *
 * For most apps, API encoding is simpler. Use local encoding for
 * privacy-sensitive apps where data should never leave the device.
 */
export function useBagle() {
  const [encoding, setEncoding] = useState(null);
  const [similarity, setSimilarity] = useState(null);
  const [isEncoding, setIsEncoding] = useState(false);

  const encode = useCallback(async (samples) => {
    setIsEncoding(true);
    try {
      const res = await fetch(`${BAGLE_API}/api/v1/encode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: Array.from(samples) }),
      });

      if (!res.ok) throw new Error(`Encode failed: ${res.status}`);

      const data = await res.json();
      setEncoding(data.encoding);
      return data;
    } catch (err) {
      console.error('Encode error:', err);
      return null;
    } finally {
      setIsEncoding(false);
    }
  }, []);

  const compare = useCallback(async (encodingA, encodingB) => {
    try {
      const res = await fetch(`${BAGLE_API}/api/v1/similarity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encoding_a: Array.from(encodingA),
          encoding_b: Array.from(encodingB),
        }),
      });

      if (!res.ok) throw new Error(`Similarity failed: ${res.status}`);

      const data = await res.json();
      setSimilarity(data);
      return data;
    } catch (err) {
      console.error('Similarity error:', err);
      return null;
    }
  }, []);

  return { encoding, similarity, isEncoding, encode, compare };
}
