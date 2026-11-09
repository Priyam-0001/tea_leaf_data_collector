import { create } from 'zustand';

import { sampleRepository } from '@/database/sampleRepository';
import type { Flush, Sample, SampleFilterCriteria, SampleSearchField } from '@/types/sample';

const initialFilterCriteria: SampleFilterCriteria = {
  query: '',
  cloneNumber: '',
  treeNumber: '',
  leafNumber: '',
  gardenName: '',
  remarks: '',
};

interface SampleStore {
  samples: Sample[];
  loading: boolean;
  error: string | null;

  cloneNumber: string;
  flush: Flush;
  gardenName: string;

  setCloneNumber: (number: string) => void;
  setFlush: (flush: Flush) => void;
  setGardenName: (name: string) => void;

  searchQuery: string;
  searchField: SampleSearchField;
  filterCriteria: SampleFilterCriteria;

  loadSamples: () => Promise<void>;
  loadFilteredSamples: (criteria?: Partial<SampleFilterCriteria>) => Promise<void>;

  setSearchQuery: (query: string) => void;
  setSearchField: (field: SampleSearchField) => void;
  setFilterCriteria: (criteria: Partial<SampleFilterCriteria>) => void;
  resetFilterCriteria: () => void;
}

export const useSampleStore = create<SampleStore>((set, get) => ({
  samples: [],
  loading: false,
  error: null,

  cloneNumber: '',
  flush: 'first_flush',
  gardenName: '',

  setCloneNumber: (number: string) => { set({ cloneNumber: number }) },
  setFlush: (currentFlush: Flush) => { set({ flush: currentFlush }) },
  setGardenName: (name: string) => { set({ gardenName: name }) },

  searchQuery: '',
  searchField: 'all',
  filterCriteria: { ...initialFilterCriteria },

  loadSamples: async () => {
    const { loading } = get();
    if (loading) return;

    set({
      loading: true,
      error: null,
    });

    try {
      const samples = await sampleRepository.getAll();
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

  loadFilteredSamples: async (criteria?: Partial<SampleFilterCriteria>) => {
    const activeCriteria: SampleFilterCriteria = {
      ...get().filterCriteria,
      ...(criteria || {}),
    };

    set({
      loading: true,
      error: null,
      filterCriteria: activeCriteria,
      searchQuery: activeCriteria.query || '',
    });

    try {
      const samples = await sampleRepository.filter(activeCriteria);
      set({
        samples,
        loading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load filtered samples.';

      set({
        error: message,
        loading: false,
      });
    }
  },

  setSearchQuery: (query: string) => {
    set((state) => ({
      searchQuery: query,
      filterCriteria: {
        ...state.filterCriteria,
        query,
      },
    }));
  },

  setSearchField: (field: SampleSearchField) => {
    set({
      searchField: field,
    });
  },

  setFilterCriteria: (criteria: Partial<SampleFilterCriteria>) => {
    set((state) => ({
      filterCriteria: {
        ...state.filterCriteria,
        ...criteria,
      },
      searchQuery: criteria.query !== undefined ? criteria.query : state.searchQuery,
    }));
  },

  resetFilterCriteria: () => {
    set({
      filterCriteria: { ...initialFilterCriteria },
      searchQuery: '',
    });
  },
}));
