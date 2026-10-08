export const SAMPLES_TABLE = `
CREATE TABLE IF NOT EXISTS samples (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,

  -- Sample Information
  clone_number TEXT NOT NULL,
  tree_number TEXT NOT NULL,
  leaf_number TEXT NOT NULL,
  leaf_position TEXT NOT NULL,

  -- Meter Readings
  meter_reading_1 REAL NOT NULL,
  meter_reading_2 REAL NOT NULL,
  meter_reading_3 REAL NOT NULL,

  -- Collection Information
  flush TEXT NOT NULL,
  flush_auto_detected BOOLEAN NOT NULL DEFAULT FALSE,

  -- GPS
  gps_latitude REAL,
  gps_longitude REAL,
  gps_accuracy REAL,

  -- Manual Location
  garden_name TEXT NOT NULL,
  section_name TEXT NOT NULL,

  -- Plant Health
  healthy BOOLEAN NOT NULL DEFAULT FALSE,
  wilting BOOLEAN NOT NULL DEFAULT FALSE,
  chlorosis BOOLEAN NOT NULL DEFAULT FALSE,
  scorching BOOLEAN NOT NULL DEFAULT FALSE,
  pest_damage BOOLEAN NOT NULL DEFAULT FALSE,
  disease BOOLEAN NOT NULL DEFAULT FALSE,

  -- Wet Lab
  wet_lab_completed BOOLEAN NOT NULL DEFAULT FALSE,

  -- Device Information
  device_manufacturer TEXT NOT NULL,
  device_model TEXT NOT NULL,
  os_name TEXT NOT NULL,
  os_version TEXT NOT NULL,
  installation_id TEXT NOT NULL,
  app_version TEXT NOT NULL,

  -- Notes
  remarks TEXT NOT NULL DEFAULT '',

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

export const SAMPLE_IMAGES_TABLE = `
CREATE TABLE IF NOT EXISTS sample_images (
  id TEXT PRIMARY KEY,
  sample_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL,

  FOREIGN KEY (sample_id)
    REFERENCES samples(id)
    ON DELETE CASCADE
);
`;

export const SAMPLE_IMAGES_INDEX = `
CREATE INDEX IF NOT EXISTS idx_sample_images_sample_id
ON sample_images(sample_id);
`;

export const SAMPLES_SEARCH_INDEX = `
CREATE INDEX IF NOT EXISTS idx_samples_search
ON samples(
  clone_number,
  tree_number,
  leaf_number,
  garden_name,
  section_name
);
`;