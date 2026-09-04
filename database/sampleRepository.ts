import { getDatabase } from '@/database/connection';
import type {
  Sample,
  SampleImageRow,
  SampleRow,
  SampleSearchField,
  SampleUpdateInput,
} from '@/types/sample';
import { toIsoTimestamp } from '@/utils/dateFormat';

function rowToSample(row: SampleRow, images: string[]): Sample {
  return {
    id: row.id,

    // Sample Information
    cloneNumber: row.clone_number,
    treeNumber: row.tree_number,
    leafNumber: row.leaf_number,
    leafPosition: row.leaf_position as Sample["leafPosition"],

    // Meter Readings
    meterReading1: row.meter_reading_1,
    meterReading2: row.meter_reading_2,
    meterReading3: row.meter_reading_3,

    // Wet Lab
    wetLabRequired: row.wet_lab_required === 1,
    wetLabCompleted: row.wet_lab_completed === 1,

    // Collection Information
    flush: row.flush,
    flushAutoDetected: row.flush_auto_detected === 1,

    // GPS
    gpsLatitude: row.gps_latitude,
    gpsLongitude: row.gps_longitude,
    gpsAccuracy: row.gps_accuracy,

    // Manual Location
    gardenName: row.garden_name,
    sectionName: row.section_name,

    // Plant Health
    healthy: row.healthy === 1,
    wilting: row.wilting === 1,
    chlorosis: row.chlorosis === 1,
    scorching: row.scorching === 1,
    pestDamage: row.pest_damage === 1,
    disease: row.disease === 1,

    // Device Information
    deviceManufacturer: row.device_manufacturer,
    deviceModel: row.device_model,
    osName: row.os_name,
    osVersion: row.os_version,
    installationId: row.installation_id,
    appVersion: row.app_version,

    // Images
    images,

    // Remarks
    remarks: row.remarks,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getImagesForSample(sampleId: string): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SampleImageRow>(
    'SELECT * FROM sample_images WHERE sample_id = ? ORDER BY sort_order ASC',
    sampleId,
  );
  return rows.map((row) => row.file_path);
}

async function hydrateSample(row: SampleRow): Promise<Sample> {
  const images = await getImagesForSample(row.id);
  return rowToSample(row, images);
}

export type CreateSampleParams = Omit<
  Sample,
  'createdAt' | 'updatedAt'
>;

/** Repository for sample CRUD operations. */
export const sampleRepository = {
  async create(params: CreateSampleParams): Promise<Sample> {
    const db = await getDatabase();
    const now = toIsoTimestamp();

    await db.runAsync(
      `INSERT INTO samples (
      id,

      clone_number,
      tree_number,
      leaf_number,
      leaf_position,

      meter_reading_1,
      meter_reading_2,
      meter_reading_3,

      flush,
      flush_auto_detected,

      gps_latitude,
      gps_longitude,
      gps_accuracy,

      garden_name,
      section_name,

      healthy,
      wilting,
      chlorosis,
      scorching,
      pest_damage,
      disease,

      wet_lab_required,
      wet_lab_completed,

      device_manufacturer,
      device_model,
      os_name,
      os_version,
      installation_id,
      app_version,

      remarks,

      created_at,
      updated_at
    )
    VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?,
      ?, ?
    )`,

      params.id,

      params.cloneNumber.trim(),
      params.treeNumber.trim(),
      params.leafNumber.trim(),
      params.leafPosition,

      params.meterReading1,
      params.meterReading2,
      params.meterReading3,

      params.flush,
      params.flushAutoDetected ? 1 : 0,

      params.gpsLatitude,
      params.gpsLongitude,
      params.gpsAccuracy,

      params.gardenName.trim(),
      params.sectionName.trim(),

      params.healthy ? 1 : 0,
      params.wilting ? 1 : 0,
      params.chlorosis ? 1 : 0,
      params.scorching ? 1 : 0,
      params.pestDamage ? 1 : 0,
      params.disease ? 1 : 0,

      params.wetLabRequired ? 1 : 0,
      params.wetLabCompleted ? 1 : 0,

      params.deviceManufacturer,
      params.deviceModel,
      params.osName,
      params.osVersion,
      params.installationId,
      params.appVersion,

      params.remarks.trim(),

      now,
      now,
    );

    for (let index = 0; index < params.images.length; index++) {
      await db.runAsync(
        `INSERT INTO sample_images
      (sample_id, file_path, sort_order)
      VALUES (?, ?, ?)`,
        params.id,
        params.images[index],
        index + 1,
      );
    }

    const row = await db.getFirstAsync<SampleRow>(
      'SELECT * FROM samples WHERE id = ?',
      params.id,
    );

    if (!row) {
      throw new Error('Failed to read sample after insert.');
    }

    return rowToSample(row, params.images);
  },

  async getAll(): Promise<Sample[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SampleRow>(
      'SELECT * FROM samples ORDER BY datetime(created_at) DESC',
    );
    return Promise.all(rows.map((row) => hydrateSample(row)));
  },

  async getById(id: string): Promise<Sample | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<SampleRow>('SELECT * FROM samples WHERE id = ?', id);
    if (!row) return null;
    return hydrateSample(row);
  },

  async search(
    query: string,
    field: SampleSearchField = 'all',
  ): Promise<Sample[]> {
    const trimmed = query.trim();

    if (!trimmed) {
      return this.getAll();
    }

    const db = await getDatabase();
    const like = `%${trimmed}%`;

    let rows: SampleRow[];

    if (field === 'all') {
      rows = await db.getAllAsync<SampleRow>(
        `SELECT * FROM samples
       WHERE id LIKE ?
          OR clone_number LIKE ?
          OR tree_number LIKE ?
          OR leaf_number LIKE ?
          OR leaf_position LIKE ?
          OR remarks LIKE ?
       ORDER BY datetime(created_at) DESC`,
        like,
        like,
        like,
        like,
        like,
        like,
      );
    } else {
      rows = await db.getAllAsync<SampleRow>(
        `SELECT * FROM samples
       WHERE ${field} LIKE ?
       ORDER BY datetime(created_at) DESC`,
        like,
      );
    }

    return Promise.all(rows.map((row) => hydrateSample(row)));
  },

  async update(id: string, updates: SampleUpdateInput): Promise<Sample> {
    const existing = await this.getById(id);

    if (!existing) {
      throw new Error(`Sample not found: ${id}`);
    }

    const db = await getDatabase();
    const now = toIsoTimestamp();

    const merged: Sample = {
      ...existing,
      ...updates,
      updatedAt: now,
    };

    await db.runAsync(
      `UPDATE samples SET
      clone_number = ?,
      tree_number = ?,
      leaf_number = ?,
      leaf_position = ?,

      meter_reading_1 = ?,
      meter_reading_2 = ?,
      meter_reading_3 = ?,

      flush = ?,
      flush_auto_detected = ?,

      garden_name = ?,
      section_name = ?,

      healthy = ?,
      wilting = ?,
      chlorosis = ?,
      scorching = ?,
      pest_damage = ?,
      disease = ?,

      wet_lab_required = ?,
      wet_lab_completed = ?,

      remarks = ?,

      updated_at = ?
    WHERE id = ?`,

      merged.cloneNumber.trim(),
      merged.treeNumber.trim(),
      merged.leafNumber.trim(),
      merged.leafPosition,

      merged.meterReading1,
      merged.meterReading2,
      merged.meterReading3,

      merged.flush,
      merged.flushAutoDetected ? 1 : 0,

      merged.gardenName.trim(),
      merged.sectionName.trim(),

      merged.healthy ? 1 : 0,
      merged.wilting ? 1 : 0,
      merged.chlorosis ? 1 : 0,
      merged.scorching ? 1 : 0,
      merged.pestDamage ? 1 : 0,
      merged.disease ? 1 : 0,

      merged.wetLabRequired ? 1 : 0,
      merged.wetLabCompleted ? 1 : 0,

      merged.remarks.trim(),

      now,
      id,
    );

    if (updates.images) {
      await db.runAsync(
        'DELETE FROM sample_images WHERE sample_id = ?',
        id,
      );

      for (let index = 0; index < merged.images.length; index++) {
        await db.runAsync(
          `INSERT INTO sample_images
        (sample_id, file_path, sort_order)
        VALUES (?, ?, ?)`,
          id,
          merged.images[index],
          index + 1,
        );
      }
    }

    const updated = await this.getById(id);

    if (!updated) {
      throw new Error('Failed to read sample after update.');
    }

    return updated;
  },

  async count(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM samples',
    );
    return result?.count ?? 0;
  },

  async clear() {
    const db = await getDatabase();

    await db.execAsync(`
      DELETE FROM samples;
      DELETE FROM sample_images;
      DELETE FROM sqlite_sequence
      WHERE name='samples';
      DELETE FROM sqlite_sequence
      WHERE name='sample_images';
    `);
  },

  async deleteByIds(ids: string[]) {
    if (ids.length === 0) {
      return;
    }

    const db = await getDatabase();
    const placeholders = ids.map(() => '?').join(', ');

    await db.runAsync(
      `DELETE FROM samples WHERE id IN (${placeholders})`,
      ...ids,
    );
  },
};
