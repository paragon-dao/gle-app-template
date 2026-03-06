import { useState, useRef, useCallback } from 'react';

// 10 seconds at 16 kHz — prevents OOM on long recordings
const MAX_SAMPLES = 160000;

/**
 * Hook to capture audio from the phone microphone.
 *
 * NOTE: Uses ScriptProcessorNode which is deprecated. For production apps,
 * migrate to AudioWorklet (requires a separate worklet file).
 *
 * SWAP THIS for any sensor:
 *   - Accelerometer: use DeviceMotionEvent
 *   - Heart rate: use camera + PPG algorithm
 *   - Typing cadence: use keydown/keyup intervals
 *   - Any sensor: just produce a number[] over time
 *
 * The GLE encoder only needs numbers. It doesn't care what produced them.
 */
export function useSensor() {
  const [isRecording, setIsRecording] = useState(false);
  const [samples, setSamples] = useState([]);
  const mediaStreamRef = useRef(null);
  const processorRef = useRef(null);
  const audioContextRef = useRef(null);
  const samplesRef = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: false },
      });

      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      samplesRef.current = [];

      processor.onaudioprocess = (e) => {
        if (samplesRef.current.length >= MAX_SAMPLES) return;
        const data = e.inputBuffer.getChannelData(0);
        samplesRef.current.push(...data);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      mediaStreamRef.current = stream;
      processorRef.current = processor;
      audioContextRef.current = audioContext;
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setSamples([...samplesRef.current]);
    setIsRecording(false);
  }, []);

  return { isRecording, samples, startRecording, stopRecording };
}
