/** ============================
 *  Enums / Literal Types
 *  ============================
 */

export type Flush =
  | 'first_flush'
  | 'second_flush'
  | 'monsoon_flush'
  | 'autumn_flush';

// export type PlantHealth =
//   | 'healthy'
//   | 'mild_stress'
//   | 'moderate_stress'
//   | 'severe_stress';

export type SampleSearchField =
  | 'all'
  | 'id'
  | 'clone_number'
  | 'tree_number'
  | 'leaf_number'
  | 'leaf_position'
  | 'remarks';

export type LeafPosition =
  | '1st_leaf'
  | '2nd_leaf'
  | '3rd_leaf'
  | '4th_leaf'
  | '5th_leaf'
  | 'maintenance_leaf';

/** ============================
 *  Main Sample Model
 *  ============================
 */

export interface Sample {
  id: string;

  // Sample Information
  cloneNumber: string;
  treeNumber: string;
  leafNumber: string;
  leafPosition: LeafPosition;

  // Meter Readings
  meterReading1: number;
  meterReading2: number;
  meterReading3: number;

  // Existing workflow
  wetLabRequired: boolean;
  wetLabCompleted: boolean;

  // Collection Information
  flush: Flush;
  flushAutoDetected: boolean;

  // GPS
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  gpsAccuracy: number | null;

  // Manual Location
  gardenName: string;
  sectionName: string;

  // Plant Health
  // overallHealth: PlantHealth;
  healthy: boolean;
  wilting: boolean;
  chlorosis: boolean;
  scorching: boolean;
  pestDamage: boolean;
  disease: boolean;

  // Device Information
  deviceManufacturer: string;
  deviceModel: string;
  osName: string;
  osVersion: string;
  installationId: string;
  appVersion: string;

  // Images
  images: string[];

  // Remarks
  remarks: string;

  createdAt: string;
  updatedAt: string;
}

/** ============================
 *  Form Input
 *  (Only user editable fields)
 *  ============================
 */

export interface SampleFormInput {
  cloneNumber: string;
  treeNumber: string;
  leafNumber: string;
  leafPosition: LeafPosition;

  meterReading1: string;
  meterReading2: string;
  meterReading3: string;

  wetLabRequired: boolean;
  wetLabCompleted: boolean;

  flush: Flush;
  flushAutoDetected: boolean;

  gardenName: string;
  sectionName: string;

  // overallHealth: PlantHealth;
  healthy: boolean;
  wilting: boolean;
  chlorosis: boolean;
  scorching: boolean;
  pestDamage: boolean;
  disease: boolean;

  remarks: string;
}

/** ============================
 *  Update Payload
 *  ============================
 */

export type SampleUpdateInput = Partial<
  Pick<
    Sample,
    | 'cloneNumber'
    | 'treeNumber'
    | 'leafNumber'
    | 'leafPosition'
    | 'meterReading1'
    | 'meterReading2'
    | 'meterReading3'
    | 'wetLabRequired'
    | 'wetLabCompleted'
    | 'flush'
    | 'flushAutoDetected'
    | 'gardenName'
    | 'sectionName'
    // | 'overallHealth'
    | 'healthy'
    | 'wilting'
    | 'chlorosis'
    | 'scorching'
    | 'pestDamage'
    | 'disease'
    | 'remarks'
    | 'images'
  >
>;

/** ============================
 *  Device Metadata
 *  ============================
 */

export interface DeviceInfo {
  manufacturer: string;
  model: string;
  osName: string;
  osVersion: string;
  installationId: string;
  appVersion: string;
}

/** ============================
 *  SQLite Row
 *  ============================
 */

export interface SampleRow {
  id: string;

  clone_number: string;
  tree_number: string;
  leaf_number: string;
  leaf_position: string;

  meter_reading_1: number;
  meter_reading_2: number;
  meter_reading_3: number;

  wet_lab_required: number;
  wet_lab_completed: number;

  flush: Flush;
  flush_auto_detected: number;

  gps_latitude: number | null;
  gps_longitude: number | null;
  gps_accuracy: number | null;

  garden_name: string;
  section_name: string;

  // overall_health: PlantHealth;
  healthy: number;
  wilting: number;
  chlorosis: number;
  scorching: number;
  pest_damage: number;
  disease: number;

  device_manufacturer: string;
  device_model: string;
  os_name: string;
  os_version: string;

  installation_id: string;
  app_version: string;

  remarks: string;

  created_at: string;
  updated_at: string;
}

/** ============================
 *  Sample Image Row
 *  ============================
 */

export interface SampleImageRow {
  id: number;
  sample_id: string;
  file_path: string;
  sort_order: number;
}