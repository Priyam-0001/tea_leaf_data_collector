import { Activity } from 'lucide-react-native';
import { Control } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { ControlledFormField } from '@/components/ControlledFormField';
import { SectionCard } from '@/components/SectionCard';
import type { SampleFormInput } from '@/types/sample';

interface MeterReadingsSectionProps {
  control: Control<SampleFormInput>;
}

export function MeterReadingsSection({
  control,
}: MeterReadingsSectionProps) {
  return (
    <SectionCard
      title="Chlorophyll Meter Readings"
      badge="SPAD"
      icon={<Activity size={20} color="#16A34A" />}
    >
      <View style={styles.readingsRow}>
        <View style={styles.readingCol}>
          <ControlledFormField
            control={control}
            name="meterReading1"
            label="Reading 1"
            placeholder="0.0"
            keyboardType="decimal-pad"
            returnKeyType="next"
            requiredField={true}
          />
        </View>

        <View style={styles.readingCol}>
          <ControlledFormField
            control={control}
            name="meterReading2"
            label="Reading 2"
            placeholder="0.0"
            keyboardType="decimal-pad"
            returnKeyType="next"
            requiredField={true}
          />
        </View>

        <View style={styles.readingCol}>
          <ControlledFormField
            control={control}
            name="meterReading3"
            label="Reading 3"
            placeholder="0.0"
            keyboardType="decimal-pad"
            returnKeyType="next"
            requiredField={true}
          />
        </View>
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  readingsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  readingCol: {
    flex: 1,
  },
});
