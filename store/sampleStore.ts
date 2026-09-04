import { create } from 'zustand';

import { sampleRepository } from '@/database/sampleRepository';
import type { Sample, SampleSearchField } from '@/types/sample';

interface SampleStore {
  samples: Sample[];
  loading: boolean;
  error: string | null;

  searchQuery: string;
  searchField: SampleSearchField;

  loadSamples: (query?: string, field?: SampleSearchField) => Promise<void>;

  setSearchQuery: (query: string) => void;
  setSearchField: (field: SampleSearchField) => void;
}

export const useSampleStore = create<SampleStore>((set, get) => ({
  samples: [],
  loading: false,
  error: null,

  searchQuery: '',
  searchField: 'all',

  loadSamples: async (query?: string, field?: SampleSearchField) => {
    const { loading } = get();
    if (loading) return;

    const searchQuery = query ?? get().searchQuery;
    const searchField = field ?? get().searchField;

    set({
      loading: true,
      error: null,
    });

    try {
      const samples =
        searchQuery.trim().length > 0
          ? await sampleRepository.search(searchQuery, searchField)
          : await sampleRepository.getAll();
      set({
        samples,
        loading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load samples.';

      set({
        error: message,
        loading: false,
      });
    }
  },

  setSearchQuery: (query: string) => {
    set({
      searchQuery: query,
    });
  },

  setSearchField: (field: SampleSearchField) => {
    set({
      searchField: field,
    });
  },
}));