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

// Tocklai Tea Research Institute — standard clone numbers
export const cloneNumberOptions: { label: string; value: string }[] = [
  'TV-1', 'TV-2', 'TV-3', 'TV-4', 'TV-5',
  'TV-6', 'TV-7', 'TV-8', 'TV-9', 'TV-10',
  'TV-11', 'TV-12', 'TV-13', 'TV-14', 'TV-15',
  'TV-16', 'TV-17', 'TV-18', 'TV-19', 'TV-20',
  'TV-21', 'TV-22', 'TV-23', 'TV-24', 'TV-25',
  'TV-26', 'TV-27', 'TV-28', 'TV-29',
  'TS-449', 'TS-500', 'TS-520',
  'T-78', 'T-83',
  'Tingamira-17', 'BS-1', 'Other',
].map((v) => ({ label: v, value: v }));