import { useState, useCallback, useRef, useEffect, SetStateAction, Dispatch } from 'react';
import { apiRequest, ApiError } from '../lib/api';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  setData: Dispatch<SetStateAction<T | null>>;
}

export function useApi<T>(
  endpoint?: string,
  options?: { method?: string; autoFetch?: boolean; deps?: any[] }
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (overrideEndpoint?: string, body?: unknown): Promise<T | null> => {
      const url = overrideEndpoint || endpoint;
      if (!url) return null;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await apiRequest<T>(url, {
          method: options?.method || 'GET',
          body,
        });
        if (mountedRef.current) {
          setState({ data, isLoading: false, error: null });
        }
        return data;
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Unknown error';
        if (mountedRef.current) {
          setState((prev) => ({ ...prev, isLoading: false, error: msg }));
        }
        return null;
      }
    },
    [endpoint, options?.method]
  );

  useEffect(() => {
    if (options?.autoFetch !== false && endpoint) {
      execute();
    }
  }, [endpoint, ...(options?.deps || [])]);

  return {
    ...state,
    execute,
    setData: (d) =>
      setState((prev) => ({
        ...prev,
        data: typeof d === 'function' ? (d as (prev: T | null) => T | null)(prev.data) : d,
      })),
  };
}
