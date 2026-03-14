import { useState, useCallback, useRef } from 'react';
import { BagleClient } from '@paragondao/bagle-sdk';

const client = new BagleClient({
  baseUrl: import.meta.env?.VITE_BAGLE_API_URL || 'https://bagle-api.fly.dev',
});

/**
 * Hook for encoding signals and comparing encodings via BAGLE SDK.
 *
 * Two encoding paths:
 *   1. API encoding (this hook) — send samples to BAGLE API, get 128 coefficients back
 *   2. Local encoding — import { gleEncodeSignal } from '@paragondao/bagle-sdk'
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
      const result = await client.encode(Array.from(samples));
      setEncoding(result.encoding);
      return result;
    } catch (err) {
      console.error('Encode error:', err);
      return null;
    } finally {
      setIsEncoding(false);
    }
  }, []);

  const compare = useCallback(async (encodingA, encodingB) => {
    try {
      const result = await client.similarity(
        Array.from(encodingA),
        Array.from(encodingB),
      );
      setSimilarity(result);
      return result;
    } catch (err) {
      console.error('Similarity error:', err);
      return null;
    }
  }, []);

  return { encoding, similarity, isEncoding, encode, compare };
}
