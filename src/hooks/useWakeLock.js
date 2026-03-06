import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for Screen Wake Lock API.
 *
 * Keeps the screen on during active recording or analysis.
 * Essential for health apps — you don't want the screen to turn off
 * while someone is doing a breathing exercise or EEG session.
 */
export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState(null);
  const [isSupported] = useState(() => 'wakeLock' in navigator);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return false;
    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      lock.addEventListener('release', () => setWakeLock(null));
      return true;
    } catch {
      return false;
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
    }
  }, [wakeLock]);

  // Re-acquire on visibility change (browser releases on tab switch)
  useEffect(() => {
    if (!wakeLock) return;
    const handler = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const lock = await navigator.wakeLock.request('screen');
          setWakeLock(lock);
        } catch { /* ignore */ }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [wakeLock]);

  return {
    isSupported,
    isActive: !!wakeLock,
    requestWakeLock,
    releaseWakeLock,
  };
}
