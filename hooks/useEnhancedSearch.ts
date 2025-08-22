// hooks/useEnhancedSearch.ts

import { useCallback, useMemo, useState } from 'react';

const SEARCH_CONFIG = {
  SEARCH_DEBOUNCE: 300,
  DEFAULT_SEARCH_LIMIT: 20,
  MIN_SEARCH_LENGTH: 2,
  MAX_SUGGESTIONS: 5
};

interface SearchFilters {
  artist?: string;
  label?: string;
  format?: string;
  genre?: string;
  week?: string;
  priceRange?: { min?: number; max?: number };
  inStock?: boolean;
}

interface SearchState {
  query: string;
  results: any[];
  mixtapes: any[];
  suggestions: {
    artists: string[];
    labels: string[];
    tracks: string[];
  };
  isLoading: boolean;
  isLoadingSuggestions: boolean;
  total: number;
  page: number;
  totalPages: number;
  searchTime: number;
  error: string | null;
}

interface UseEnhancedSearchOptions {
  includeMixtapes?: boolean;
  autoSearch?: boolean;
  debounceMs?: number;
  limit?: number;
  enableSuggestions?: boolean;
}

export const useEnhancedSearch = (options: UseEnhancedSearchOptions = {}) => {
  const {
    includeMixtapes = false,
    autoSearch = true,
    debounceMs = SEARCH_CONFIG.SEARCH_DEBOUNCE,
    limit = SEARCH_CONFIG.DEFAULT_SEARCH_LIMIT,
    enableSuggestions = true
  } = options;

  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    mixtapes: [],
    suggestions: { artists: [], labels: [], tracks: [] },
    isLoading: false,
    isLoadingSuggestions: false,
    total: 0,
    page: 1,
    totalPages: 0,
    searchTime: 0,
    error: null
  });

  const [filters, setFilters] = useState<SearchFilters>({});
  const [sort, setSort] = useState<string>('relevance');

  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;

    return (
      searchQuery: string,
      searchFilters: SearchFilters,
      searchSort: string,
      searchPage: number = 1
    ) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        if (!searchQuery.trim() && Object.keys(searchFilters).length === 0) {
          setState((prev) => ({
            ...prev,
            results: [],
            mixtapes: [],
            total: 0,
            totalPages: 0,
            isLoading: false,
            error: null
          }));
          return;
        }

        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
          // Mock search result for now
          const result = {
            products: [],
            total: 0,
            page: 1,
            totalPages: 0,
            searchTime: 0
          };

          setState((prev) => ({
            ...prev,
            results: result.products || [],
            mixtapes: [],
            total: result.total || 0,
            page: result.page || 1,
            totalPages: result.totalPages || 0,
            searchTime: result.searchTime || 0,
            isLoading: false
          }));
        } catch (error) {
          console.error('Search error:', error);
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Search failed. Please try again.'
          }));
        }
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    };
  }, [includeMixtapes, limit, debounceMs]);

  const debouncedSuggestions = useMemo(() => {
    let timeoutId: NodeJS.Timeout;

    return (searchQuery: string) => {
      clearTimeout(timeoutId);

      if (!enableSuggestions || searchQuery.length < SEARCH_CONFIG.MIN_SEARCH_LENGTH) {
        setState((prev) => ({
          ...prev,
          suggestions: { artists: [], labels: [], tracks: [] },
          isLoadingSuggestions: false
        }));
        return;
      }

      setState((prev) => ({ ...prev, isLoadingSuggestions: true }));

      timeoutId = setTimeout(async () => {
        try {
          const suggestions = { artists: [], labels: [], tracks: [] };
          setState((prev) => ({
            ...prev,
            suggestions,
            isLoadingSuggestions: false
          }));
        } catch (error) {
          console.error('Suggestions error:', error);
          setState((prev) => ({
            ...prev,
            suggestions: { artists: [], labels: [], tracks: [] },
            isLoadingSuggestions: false
          }));
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    };
  }, [enableSuggestions]);

  const search = useCallback(
    (query?: string, customFilters?: SearchFilters, customSort?: string, page?: number) => {
      const searchQuery = query !== undefined ? query : state.query;
      const searchFilters = customFilters !== undefined ? customFilters : filters;
      const searchSort = customSort !== undefined ? customSort : sort;
      const searchPage = page !== undefined ? page : 1;

      debouncedSearch(searchQuery, searchFilters, searchSort, searchPage);
    },
    [state.query, filters, sort, debouncedSearch]
  );

  const setQuery = useCallback(
    (query: string) => {
      setState((prev) => ({ ...prev, query, page: 1 }));

      if (autoSearch) {
        debouncedSearch(query, filters, sort, 1);
      }

      if (enableSuggestions) {
        debouncedSuggestions(query);
      }
    },
    [autoSearch, filters, sort, debouncedSearch, debouncedSuggestions, enableSuggestions]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);

      if (autoSearch) {
        debouncedSearch(state.query, updatedFilters, sort, 1);
      }
    },
    [filters, state.query, sort, autoSearch, debouncedSearch]
  );

  const clearFilters = useCallback(() => {
    setFilters({});

    if (autoSearch) {
      debouncedSearch(state.query, {}, sort, 1);
    }
  }, [state.query, sort, autoSearch, debouncedSearch]);

  const updateSort = useCallback(
    (newSort: string) => {
      setSort(newSort);

      if (autoSearch) {
        debouncedSearch(state.query, filters, newSort, 1);
      }
    },
    [state.query, filters, autoSearch, debouncedSearch]
  );

  const loadMore = useCallback(() => {
    if (state.page < state.totalPages && !state.isLoading) {
      const nextPage = state.page + 1;
      setState((prev) => ({ ...prev, page: nextPage }));
      debouncedSearch(state.query, filters, sort, nextPage);
    }
  }, [state.page, state.totalPages, state.isLoading, state.query, filters, sort, debouncedSearch]);

  const clearSearch = useCallback(() => {
    setState({
      query: '',
      results: [],
      mixtapes: [],
      suggestions: { artists: [], labels: [], tracks: [] },
      isLoading: false,
      isLoadingSuggestions: false,
      total: 0,
      page: 1,
      totalPages: 0,
      searchTime: 0,
      error: null
    });
    setFilters({});
    setSort('relevance');
  }, []);

  const applySuggestion = useCallback(
    (suggestion: string, type: 'artist' | 'label' | 'track') => {
      if (type === 'artist') {
        updateFilters({ artist: suggestion });
      } else if (type === 'label') {
        updateFilters({ label: suggestion });
      } else {
        setQuery(suggestion);
      }
    },
    [updateFilters, setQuery]
  );

  return {
    query: state.query,
    results: state.results,
    mixtapes: state.mixtapes,
    suggestions: state.suggestions,
    isLoading: state.isLoading,
    isLoadingSuggestions: state.isLoadingSuggestions,
    total: state.total,
    page: state.page,
    totalPages: state.totalPages,
    searchTime: state.searchTime,
    error: state.error,
    filters,
    sort,

    setQuery,
    search,
    updateFilters,
    clearFilters,
    updateSort,
    loadMore,
    clearSearch,
    applySuggestion,

    hasResults: state.results.length > 0,
    hasMixtapes: state.mixtapes.length > 0,
    hasSuggestions:
      state.suggestions.artists.length > 0 ||
      state.suggestions.labels.length > 0 ||
      state.suggestions.tracks.length > 0,
    canLoadMore: state.page < state.totalPages,
    hasFilters: Object.keys(filters).length > 0
  };
};
