import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { DropdownField } from '@/components/DropdownField';
import { SampleSummaryCard } from '@/components/SampleSummaryCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';

import {
  COLORS,
  FONT_SIZES,
  SPACING,
} from '@/constants/theme';

import { useSampleStore } from '@/store/sampleStore';
import type { SampleSearchField } from '@/types/sample';

const searchOptions = [
  { label: 'All Fields', value: 'all' },
  { label: 'Sample ID', value: 'id' },
  { label: 'Clone Number', value: 'clone_number' },
  { label: 'Tree Number', value: 'tree_number' },
  { label: 'Leaf Number', value: 'leaf_number' },
  { label: 'Leaf Position', value: 'leaf_position' },
  { label: 'Remarks', value: 'remarks' },
];

export default function UpdateSampleListScreen() {
  const samples = useSampleStore((state) => state.samples);
  const loading = useSampleStore((state) => state.loading);
  const searchQuery = useSampleStore((state) => state.searchQuery);
  const searchField = useSampleStore((state) => state.searchField);
  const loadSamples = useSampleStore((state) => state.loadSamples);
  const setSearchQuery = useSampleStore((state) => state.setSearchQuery);
  const setSearchField = useSampleStore((state) => state.setSearchField);
  const [activePanel, setActivePanel] = useState<'with_images' | 'without_images'>('with_images');

  useFocusEffect(
    useCallback(() => {
      loadSamples(searchQuery, searchField);
    }, [loadSamples, searchField, searchQuery]),
  );

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      loadSamples(text, searchField);
    },
    [loadSamples, searchField, setSearchQuery],
  );

  const handleSearchFieldChange = useCallback(
    (field: string) => {
      const value = field as SampleSearchField;

      setSearchField(value);

      loadSamples(searchQuery, value);
    },
    [loadSamples, searchQuery, setSearchField],
  );

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

          <DropdownField
            label="Search By"
            value={searchField}
            onValueChange={handleSearchFieldChange}
            options={searchOptions}
          />

          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
          />

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
          </Text>

          <FlatList
            data={filteredSamples}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              loading ? (
                <Text style={styles.empty}>
                  Loading samples...
                </Text>
              ) : (
                <Text style={styles.empty}>
                  No samples found in this panel.
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

          <ActionButton
            label="Back"
            variant="secondary"
            onPress={() => router.back()}
            style={styles.back}
          />
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

  resultTitle: {
    fontSize: FONT_SIZES.label,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
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
