import { router, useFocusEffect } from 'expo-router';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
  Search,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SampleSummaryCard } from '@/components/SampleSummaryCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';

import { useSampleStore } from '@/store/sampleStore';
import type { SampleFilterCriteria } from '@/types/sample';

const C = {
  navy: '#0D1F3C',
  navyMid: '#1E3A5F',
  page: '#F0F5FF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  danger: '#DC2626',
};

export default function UpdateSampleListScreen() {
  const samples = useSampleStore((state) => state.samples);
  const loading = useSampleStore((state) => state.loading);
  const filterCriteria = useSampleStore((state) => state.filterCriteria);
  const setFilterCriteria = useSampleStore((state) => state.setFilterCriteria);
  const resetFilterCriteria = useSampleStore((state) => state.resetFilterCriteria);
  const loadFilteredSamples = useSampleStore((state) => state.loadFilteredSamples);

  const [activePanel, setActivePanel] = useState<'with_images' | 'without_images'>('with_images');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFilterCount = [
    filterCriteria.query?.trim(),
    filterCriteria.cloneNumber?.trim(),
    filterCriteria.treeNumber?.trim(),
    filterCriteria.leafNumber?.trim(),
    filterCriteria.gardenName?.trim(),
  ].filter(Boolean).length;

  const runFilteredQuery = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      loadFilteredSamples();
    }, 200);
  }, [loadFilteredSamples]);

  useFocusEffect(
    useCallback(() => {
      loadFilteredSamples();
    }, [loadFilteredSamples])
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleQueryChange = useCallback(
    (text: string) => {
      setFilterCriteria({ query: text });
      runFilteredQuery();
    },
    [setFilterCriteria, runFilteredQuery]
  );

  const handleFilterFieldChange = useCallback(
    (field: keyof SampleFilterCriteria, value: string) => {
      setFilterCriteria({ [field]: value });
      runFilteredQuery();
    },
    [setFilterCriteria, runFilteredQuery]
  );

  const handleClearFilters = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    resetFilterCriteria();
    loadFilteredSamples({
      query: '',
      cloneNumber: '',
      treeNumber: '',
      leafNumber: '',
      gardenName: '',
      remarks: '',
    });
  }, [resetFilterCriteria, loadFilteredSamples]);

  const filteredSamples = samples.filter((sample) =>
    activePanel === 'with_images'
      ? sample.images.length > 0
      : sample.images.length === 0
  );

  const countWithImages = samples.filter((s) => s.images.length > 0).length;
  const countWithoutImages = samples.length - countWithImages;

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        <ScreenHeader
          title="View / Update Samples"
          subtitle="Search, review, and modify field sample records"
        />

        {/* Tab Filter Bar: With Images vs Without Images */}
        <View style={styles.tabContainer}>
          <Pressable
            onPress={() => setActivePanel('with_images')}
            style={[
              styles.tabBtn,
              activePanel === 'with_images' ? styles.tabBtnActive : null,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activePanel === 'with_images' ? styles.tabTextActive : null,
              ]}
            >
              With Photos ({countWithImages})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActivePanel('without_images')}
            style={[
              styles.tabBtn,
              activePanel === 'without_images' ? styles.tabBtnActive : null,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activePanel === 'without_images' ? styles.tabTextActive : null,
              ]}
            >
              No Photos ({countWithoutImages})
            </Text>
          </Pressable>
        </View>

        {/* Filter Trigger Bar */}
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setIsFiltersOpen((prev) => !prev)}
            style={[
              styles.filterToggleBtn,
              isFiltersOpen ? styles.filterToggleBtnActive : null,
              activeFilterCount > 0 && !isFiltersOpen ? styles.filterHasActive : null,
            ]}
          >
            <View style={styles.filterLeft}>
              <Filter
                size={16}
                color={isFiltersOpen ? '#FFFFFF' : C.navyMid}
              />
              <Text
                style={[
                  styles.filterToggleText,
                  isFiltersOpen ? styles.filterToggleTextActive : null,
                ]}
              >
                {isFiltersOpen ? 'Close Attribute Filters' : 'Filter by Attributes'}
              </Text>
              {activeFilterCount > 0 ? (
                <View style={styles.filterCountBadge}>
                  <Text style={styles.filterCountText}>{activeFilterCount}</Text>
                </View>
              ) : null}
            </View>

            {isFiltersOpen ? (
              <ChevronUp size={18} color="#FFFFFF" />
            ) : (
              <ChevronDown size={18} color={C.textMuted} />
            )}
          </Pressable>

          {activeFilterCount > 0 ? (
            <Pressable onPress={handleClearFilters} style={styles.resetPill}>
              <RotateCcw size={13} color={C.danger} />
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Expandable Filter Card */}
        {isFiltersOpen ? (
          <View style={styles.filterCard}>
            <SearchBar
              value={filterCriteria.query || ''}
              onChangeText={handleQueryChange}
              placeholder="Search keyword, remark, ID..."
            />

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.inputLabel}>Clone Number</Text>
                <TextInput
                  style={styles.gridInput}
                  placeholder="e.g. TV-1"
                  placeholderTextColor={C.textLight}
                  value={filterCriteria.cloneNumber || ''}
                  onChangeText={(val) => handleFilterFieldChange('cloneNumber', val)}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.gridCol}>
                <Text style={styles.inputLabel}>Tree Number</Text>
                <TextInput
                  style={styles.gridInput}
                  placeholder="e.g. 12"
                  placeholderTextColor={C.textLight}
                  value={filterCriteria.treeNumber || ''}
                  onChangeText={(val) => handleFilterFieldChange('treeNumber', val)}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.inputLabel}>Leaf Number</Text>
                <TextInput
                  style={styles.gridInput}
                  placeholder="e.g. 3"
                  placeholderTextColor={C.textLight}
                  value={filterCriteria.leafNumber || ''}
                  onChangeText={(val) => handleFilterFieldChange('leafNumber', val)}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.gridCol}>
                <Text style={styles.inputLabel}>Garden Name</Text>
                <TextInput
                  style={styles.gridInput}
                  placeholder="e.g. Tocklai"
                  placeholderTextColor={C.textLight}
                  value={filterCriteria.gardenName || ''}
                  onChangeText={(val) => handleFilterFieldChange('gardenName', val)}
                />
              </View>
            </View>
          </View>
        ) : null}

        {/* Samples List */}
        <FlatList
          data={filteredSamples}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                {loading ? 'Loading samples…' : 'No Samples Found'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {loading
                  ? 'Fetching local SQLite database records…'
                  : activeFilterCount > 0
                  ? 'Try relaxing your filter criteria above.'
                  : 'No records exist in this tab.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <SampleSummaryCard
              sample={item}
              onPress={() =>
                router.push({
                  pathname: '/update-sample/[id]',
                  params: { id: item.id },
                })
              }
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.page,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: C.card,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
  },
  tabTextActive: {
    color: C.navy,
    fontWeight: '800',
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  filterToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  filterToggleBtnActive: {
    backgroundColor: C.navyMid,
    borderColor: C.navyMid,
  },
  filterHasActive: {
    borderColor: C.blue,
  },
  filterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.navyMid,
  },
  filterToggleTextActive: {
    color: '#FFFFFF',
  },
  filterCountBadge: {
    backgroundColor: C.blue,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  resetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  resetText: {
    color: C.danger,
    fontSize: 12,
    fontWeight: '700',
  },

  filterCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 10,
    shadowColor: '#1A3A6E',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridCol: {
    flex: 1,
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.navy,
  },
  gridInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13.5,
    color: C.navy,
  },

  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.navy,
  },
  emptySubtitle: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: 'center',
  },
});
