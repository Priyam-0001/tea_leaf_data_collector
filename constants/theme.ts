/** Shared UI and layout constants for field-worker friendly design. */

export const COLORS = {
  background: '#F5F5F5',
  surface: '#FFFFFF',

  primary: '#1B5E20',
  primaryDark: '#0D3B12',

  text: '#111111',
  textSecondary: '#444444',

  border: '#CCCCCC',
  divider: '#E5E5E5',

  danger: '#B71C1C',
  disabled: '#9E9E9E',
} as const;

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const FONT_SIZES = {
  label: 18,
  input: 16,
  body: 16,

  button: 22,

  title: 28,
  subtitle: 20,

  sectionTitle: 22,
  helper: 16,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;


export const SHADOW = {
  elevation: 2,

  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 4,
  shadowOffset: {
    width: 0,
    height: 2,
  },
} as const;

export const LAYOUT = {
  screenHorizontalPadding: SPACING.md,
  screenVerticalPadding: SPACING.lg,

  sectionGap: SPACING.xl,
  fieldGap: SPACING.md,
  screenGap: SPACING.xl,
  checkboxGap: SPACING.sm,
} as const;

export const BUTTON_HEIGHT = 44;
export const INPUT_HEIGHT = 44;

export const DB_NAME = 'tea_samples.db';
export const INSTALLATION_ID_KEY = 'tea_installation_id';
export const IMAGES_DIR_NAME = 'sample_images';