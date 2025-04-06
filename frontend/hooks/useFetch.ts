import { useState, useEffect, useCallback } from 'react';

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseFetchOptions {
  skip?: boolean;
  dependencies?: any[];
}

/**
 * Hook personnalisé pour gérer les requêtes API avec gestion d'état
 * @param fetchFn Fonction asynchrone qui effectue la requête API
 * @param options Options de configuration (skip, dependencies)
 */
function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = {}
): UseFetchState<T> & { refetch: () => Promise<void> } {
  const { skip = false, dependencies = [] } = options;
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    isLoading: !skip,
    error: null,
  });

  const execute = useCallback(async () => {
    if (skip) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await fetchFn();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  }, [fetchFn, skip, ...dependencies]);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(async () => {
    await execute();
  }, [execute]);

  return {
    ...state,
    refetch,
  };
}

export default useFetch; 