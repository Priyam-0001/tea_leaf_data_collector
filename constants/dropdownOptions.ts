import type { Flush, LeafPosition } from '@/types/sample';

export const leafPositionOptions: {
  label: string;
  value: LeafPosition;
}[] = [
  { label: '1st Leaf', value: '1st_leaf' },
  { label: '2nd Leaf', value: '2nd_leaf' },
  { label: '3rd Leaf', value: '3rd_leaf' },
  { label: '4th Leaf', value: '4th_leaf' },
  { label: '5th Leaf', value: '5th_leaf' },
  { label: 'Maintenance Leaf', value: 'maintenance_leaf' },
];

export const flushOptions: {
  label: string;
  value: Flush;
}[] = [
  { label: 'First Flush', value: 'first_flush' },
  { label: 'Second Flush', value: 'second_flush' },
  { label: 'Monsoon Flush', value: 'monsoon_flush' },
  { label: 'Autumn Flush', value: 'autumn_flush' },
];