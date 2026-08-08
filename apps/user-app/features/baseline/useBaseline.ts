import { useCallback, useEffect, useState } from 'react';
import type { BaselineSessionRecord, CompletenessRecord, DailyTaskRecord, UserProfile } from '@sarira/shared-types';
import { ApiClientError } from '@sarira/api-client';
import { api } from '@/services/api';

export interface CurrentBaselineView {
  baseline: BaselineSessionRecord;
  localDate: string;
  completeness: CompletenessRecord;
  tasks: DailyTaskRecord[];
  day7Available: boolean;
  day14Available: boolean;
}

export const messageFor = (cause: unknown) => cause instanceof ApiClientError ? cause.message : cause instanceof Error ? cause.message : 'Terjadi kendala. Coba kembali.';

export function useBaseline() {
  const [profile, setProfile] = useState<UserProfile>();
  const [current, setCurrent] = useState<CurrentBaselineView | null>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const reload = useCallback(async () => {
    setLoading(true); setError(undefined);
    try {
      const profileValue = await api.getProfile();
      setProfile(profileValue);
      try { setCurrent(await api.getCurrentBaseline()); }
      catch (cause) {
        if (cause instanceof ApiClientError && cause.status === 404) setCurrent(null);
        else throw cause;
      }
    } catch (cause) { setError(messageFor(cause)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void reload(), 0);
    return () => clearTimeout(timer);
  }, [reload]);
  return { profile, current, loading, error, reload };
}
