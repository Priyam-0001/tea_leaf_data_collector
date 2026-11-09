import { router, useFocusEffect } from 'expo-router';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
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
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { SampleSummaryCard } from '@/components/SampleSummaryCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';

import {
  COLORS,
  FONT_SIZES,
  RADIUS,
  SPACING,
} from '@/constants/theme';

import { useSampleStore } from '@/store/sampleStore';
import type { SampleFilterCriteria } from '@/types/sample';

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
    }, [loadFilteredSamples]),
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
    [setFilterCriteria, runFilteredQuery],
  );

  const handleFilterFieldChange = useCallback(
    (field: keyof SampleFilterCriteria, value: string) => {
      setFilterCriteria({ [field]: value });
      runFilteredQuery();
    },
    [setFilterCriteria, runFilteredQuery],
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
      : sample.images.length === 0,
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.page}>
        <View style={styles.container}>
          <ScreenHeader
            title="View/Update Sample"
            subtitle="Search and review existing records"
          />

          {/* Collapsible Accordion Header / Toggle */}
          <View style={styles.accordionToggleRow}>
            <Pressable
              onPress={() => setIsFiltersOpen((prev) => !prev)}
              style={[
                styles.accordionToggleButton,
                isFiltersOpen && styles.accordionToggleButtonActive,
                activeFilterCount > 0 && !isFiltersOpen && styles.accordionToggleHasFilters,
              ]}
              accessibilityRole="button"
              accessibilityLabel={isFiltersOpen ? 'Hide attribute filters' : 'Show attribute filters'}
            >
              <View style={styles.accordionToggleLeft}>
                <Filter
                  size={18}
                  color={
                    isFiltersOpen
                      ? '#FFFFFF'
                      : activeFilterCount > 0
                        ? COLORS.primary
                        : COLORS.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.accordionToggleText,
                    isFiltersOpen && styles.accordionToggleTextActive,
                    activeFilterCount > 0 && !isFiltersOpen && styles.accordionToggleTextHasFilters,
                  ]}
                >
                  {isFiltersOpen ? 'Hide Filters' : 'Filter by Attributes'}
                </Text>

                {activeFilterCount > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      isFiltersOpen && styles.filterBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        isFiltersOpen && styles.filterBadgeTextActive,
                      ]}
                    >
                      {activeFilterCount}
                    </Text>
                  </View>
                )}
              </View>

              {isFiltersOpen ? (
                <ChevronUp size={20} color={isFiltersOpen ? '#FFFFFF' : COLORS.text} />
              ) : (
                <ChevronDown size={20} color={COLORS.textSecondary} />
              )}
            </Pressable>

            {activeFilterCount > 0 && (
              <Pressable
                onPress={handleClearFilters}
                style={styles.quickResetButton}
                accessibilityRole="button"
                accessibilityLabel="Clear all attribute filters"
              >
                <RotateCcw size={15} color={COLORS.danger} />
                <Text style={styles.quickResetText}>Clear</Text>
              </Pressable>
            )}
          </View>

          {/* Collapsible Accordion Body */}
          {isFiltersOpen && (
            <View style={styles.accordionCard}>
              {/* Quick general search bar (by ID, remarks, etc.) */}
              <SearchBar
                value={filterCriteria.query || ''}
                onChangeText={handleQueryChange}
                placeholder="Search by ID, remark, or any keyword..."
              />
              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.inputLabel}>Clone Number</Text>
                  <TextInput
                    style={styles.gridInput}
                    placeholder="e.g. TV1"
                    placeholderTextColor={COLORS.textSecondary}
                    value={filterCriteria.cloneNumber || ''}
                    onChangeText={(val) => handleFilterFieldChange('cloneNumber', val)}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.gridCol}>
                  <Text style={styles.inputLabel}>Tree Number</Text>
                  <TextInput
                    style={styles.gridInput}
                    placeholder="e.g. 12"
                    placeholderTextColor={COLORS.textSecondary}
                    value={filterCriteria.treeNumber || ''}
                    onChangeText={(val) => handleFilterFieldChange('treeNumber', val)}
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.inputLabel}>Leaf Number</Text>
                  <TextInput
                    style={styles.gridInput}
                    placeholder="e.g. 3"
                    placeholderTextColor={COLORS.textSecondary}
                    value={filterCriteria.leafNumber || ''}
                    onChangeText={(val) => handleFilterFieldChange('leafNumber', val)}
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.gridCol}>
                  <Text style={styles.inputLabel}>Garden Name</Text>
                  <TextInput
                    style={styles.gridInput}
                    placeholder="e.g. Tocklai"
                    placeholderTextColor={COLORS.textSecondary}
                    value={filterCriteria.gardenName || ''}
                    onChangeText={(val) => handleFilterFieldChange('gardenName', val)}
                    autoCorrect={false}
                  />
                </View>
              </View>

              {activeFilterCount > 0 && (
                <Pressable
                  onPress={handleClearFilters}
                  style={styles.accordionResetBtn}
                  accessibilityRole="button"
                >
                  <RotateCcw size={14} color={COLORS.danger} />
                  <Text style={styles.accordionResetBtnText}>Reset All Filters</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Toggle between samples with and without images */}
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setActivePanel('with_images')}
              style={[
                styles.toggleButton,
                activePanel === 'with_images' ? styles.toggleButtonActive : null,
              ]}
            >
              <Text
                style={[
                  styles.toggleLabel,
                  activePanel === 'with_images' ? styles.toggleLabelActive : null,
                ]}
              >
                Samples With Images
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActivePanel('without_images')}
              style={[
                styles.toggleButton,
                activePanel === 'without_images' ? styles.toggleButtonActive : null,
              ]}
            >
              <Text
                style={[
                  styles.toggleLabel,
                  activePanel === 'without_images' ? styles.toggleLabelActive : null,
                ]}
              >
                Samples Without Images
              </Text>
            </Pressable>
          </View>

          <Text style={styles.resultTitle}>
            {activePanel === 'with_images' ? 'Samples With Images' : 'Samples Without Images'}
            {!loading && ` (${filteredSamples.length})`}
          </Text>

          <FlatList
            data={filteredSamples}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              loading ? (
                <Text style={styles.empty}>
                  Loading samples...
                </Text>
              ) : (
                <Text style={styles.empty}>
                  {activeFilterCount > 0 || filterCriteria.query
                    ? 'No matching samples found for the selected filters.'
                    : 'No samples found in this panel.'}
                </Text>
              )
            }
            renderItem={({ item }) => (
              <SampleSummaryCard
                sample={item}
                onPress={() =>
                  router.push({
                    pathname: '/update-sample/[id]',
                    params: {
                      id: item.id,
                    },
                  })
                }
              />
            )}
          />

          {/* <ActionButton
            label="Back"
            variant="secondary"
            onPress={() => router.back()}
            style={styles.back}
          /> */}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },

  accordionToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  accordionToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
  },

  accordionToggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  accordionToggleHasFilters: {
    borderColor: COLORS.primary,
  },

  accordionToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  accordionToggleText: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    color: COLORS.text,
  },

  accordionToggleTextActive: {
    color: '#FFFFFF',
  },

  accordionToggleTextHasFilters: {
    color: COLORS.primary,
  },

  filterBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  filterBadgeActive: {
    backgroundColor: '#FFFFFF',
  },

  filterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  filterBadgeTextActive: {
    color: COLORS.primary,
  },

  quickResetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm,
  },

  quickResetText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },

  accordionCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  gridRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },

  gridCol: {
    flex: 1,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },

  gridInput: {
    height: 40,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },

  accordionResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: SPACING.xs,
    paddingBottom: 2,
  },

  accordionResetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },

  resultTitle: {
    fontSize: FONT_SIZES.label,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  toggleButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  toggleLabel: {
    fontSize: FONT_SIZES.body,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },

  toggleLabelActive: {
    color: '#FFFFFF',
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: SPACING.md,
  },

  empty: {
    fontSize: FONT_SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: SPACING.md,
  },

  back: {
    marginTop: SPACING.md,
  },
});
