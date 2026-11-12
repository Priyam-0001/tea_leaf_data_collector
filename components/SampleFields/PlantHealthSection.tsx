import { ShieldAlert } from 'lucide-react-native';
import { Control } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { ControlledCheckbox } from '@/components/ControlledCheckbox';
import { ControlledFormField } from '@/components/ControlledFormField';
import { SectionCard } from '@/components/SectionCard';
import type { SampleFormInput } from '@/types/sample';

interface PlantHealthSectionProps {
  control: Control<SampleFormInput>;
}

export function PlantHealthSection({
  control,
}: PlantHealthSectionProps) {
  return (
    <SectionCard
      title="Plant Health & Symptoms"
      badge="Observation"
      icon={<ShieldAlert size={20} color="#7C3AED" />}
    >
      <View style={styles.grid}>
        <View style={styles.col}>
          <ControlledCheckbox
            control={control}
            name="healthy"
            label="Healthy"
          />
        </View>

        <View style={styles.col}>
          <ControlledCheckbox
            control={control}
            name="wilting"
            label="Wilting"
          />
        </View>

        <View style={styles.col}>
          <ControlledCheckbox
            control={control}
            name="chlorosis"
            label="Chlorosis"
          />
        </View>

        <View style={styles.col}>
          <ControlledCheckbox
            control={control}
            name="scorching"
            label="Scorching"
          />
        </View>

        <View style={styles.col}>
          <ControlledCheckbox
            control={control}
            name="pestDamage"
            label="Pest Damage"
          />
        </View>

        <View style={styles.col}>
          <ControlledCheckbox
            control={control}
            name="disease"
            label="Disease"
          />
        </View>
      </View>

      <ControlledFormField
        control={control}
        name="remarks"
        label="Remarks / Field Notes"
        placeholder="Add any extra observations (weather, pest type, shade)..."
        multiline
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  col: {
    width: '48.5%',
  },
});
