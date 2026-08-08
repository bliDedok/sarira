import { useCallback, useEffect, useRef, useState } from 'react';
import type { SaveStatus } from '@sarira/shared-types';

export function useAutosave(delay = 450) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastTask = useRef<(() => Promise<void>) | null>(null);

  const run = useCallback(async (task: () => Promise<void>) => {
    lastTask.current = task;
    setStatus('saving');
    try { await task(); setStatus('saved'); }
    catch { setStatus('failed'); }
  }, []);

  const schedule = useCallback((key: string, task: () => Promise<void>, immediate = false) => {
    if (timers.current[key]) clearTimeout(timers.current[key]);
    lastTask.current = task;
    if (immediate) { void run(task); return; }
    setStatus('saving');
    timers.current[key] = setTimeout(() => void run(task), delay);
  }, [delay, run]);

  const retry = useCallback(() => { if (lastTask.current) void run(lastTask.current); }, [run]);

  useEffect(() => () => { Object.values(timers.current).forEach(clearTimeout); }, []);
  return { status, schedule, retry, run };
}
