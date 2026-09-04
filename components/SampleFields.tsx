import { Control } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { LAYOUT } from '@/constants/theme';
import type { SampleFormInput } from '@/types/sample';

import { CollectionSection } from './SampleFields/CollectionSection';
import { MeterReadingsSection } from './SampleFields/MeterReadingsSection';
import { PlantHealthSection } from './SampleFields/PlantHealthSection';
import { SampleInformationSection } from './SampleFields/SampleInformationSection';

interface SampleFieldsProps {
  control: Control<SampleFormInput>;
}

export function SampleFields({ control }: SampleFieldsProps) {
  return (
    <View style={styles.container}>
      <SampleInformationSection control={control} />

      <MeterReadingsSection control={control} />

      <CollectionSection control={control} />

      <PlantHealthSection control={control} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: LAYOUT.sectionGap,
  },
});