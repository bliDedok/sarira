import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { profiles, weeklyAction } from '@/mocks/data';
import type { ActiveProfile } from '@sarira/shared-types';

interface PrototypeContextValue {
  activeProfile: ActiveProfile;
  profiles: ActiveProfile[];
  setActiveProfile: (profile: ActiveProfile) => void;
  elderMode: boolean;
  setElderMode: (value: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  weeklyProgress: number;
  completeWeeklyAction: () => void;
  completedTasks: string[];
  toggleTask: (id: string) => void;
}

const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<ActiveProfile>(profiles[0]!);
  const [elderMode, setElderMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState(weeklyAction.progress);
  const [completedTasks, setCompletedTasks] = useState<string[]>(['breakfast']);

  const value = useMemo<PrototypeContextValue>(
    () => ({
      activeProfile,
      profiles,
      setActiveProfile,
      elderMode,
      setElderMode,
      reducedMotion,
      setReducedMotion,
      weeklyProgress,
      completeWeeklyAction: () => setWeeklyProgress((value) => Math.min(value + 1, weeklyAction.target)),
      completedTasks,
      toggleTask: (id) =>
        setCompletedTasks((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id])),
    }),
    [activeProfile, completedTasks, elderMode, reducedMotion, weeklyProgress],
  );

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

export function usePrototype() {
  const context = useContext(PrototypeContext);
  if (!context) {
    throw new Error('usePrototype harus digunakan di dalam PrototypeProvider');
  }
  return context;
}
