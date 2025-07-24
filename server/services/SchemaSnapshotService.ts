import { SchemaInfo, DatabaseConfig, TableInfo } from '../types/database.js';

export interface SchemaSnapshot {
  id: string;
  databaseId: number;
  timestamp: Date;
  schema: SchemaInfo;
  version: string;
  checksum: string;
}

export interface SchemaChange {
  type: 'table_added' | 'table_removed' | 'column_added' | 'column_removed' | 'column_modified';
  tableName: string;
  columnName?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
}

export class SchemaSnapshotService {
  private snapshots: Map<string, SchemaSnapshot[]> = new Map();
  private lastSnapshot: Map<number, SchemaSnapshot> = new Map();

  async captureSnapshot(databaseId: number, schema: SchemaInfo): Promise<SchemaSnapshot> {
    const timestamp = new Date();
    const checksum = this.calculateChecksum(schema);
    const version = this.generateVersion(timestamp);
    
    const snapshot: SchemaSnapshot = {
      id: `${databaseId}-${timestamp.getTime()}`,
      databaseId,
      timestamp,
      schema,
      version,
      checksum
    };

    // Store snapshot
    const key = `db-${databaseId}`;
    if (!this.snapshots.has(key)) {
      this.snapshots.set(key, []);
    }
    
    const dbSnapshots = this.snapshots.get(key)!;
    dbSnapshots.push(snapshot);
    
    // Keep only last 50 snapshots per database
    if (dbSnapshots.length > 50) {
      dbSnapshots.splice(0, dbSnapshots.length - 50);
    }

    this.lastSnapshot.set(databaseId, snapshot);
    
    console.log(`Schema snapshot captured for database ${databaseId}: ${version}`);
    return snapshot;
  }

  async compareSchemas(databaseId: number, newSchema: SchemaInfo): Promise<SchemaChange[]> {
    const lastSnapshot = this.lastSnapshot.get(databaseId);
    if (!lastSnapshot) {
      // First snapshot, no comparison possible
      return [];
    }

    const changes: SchemaChange[] = [];
    const oldSchema = lastSnapshot.schema;
    const timestamp = new Date();

    // Compare tables
    const oldTables = new Map(oldSchema.tables.map(t => [t.name, t]));
    const newTables = new Map(newSchema.tables.map(t => [t.name, t]));

    // Check for added tables
    for (const [tableName, table] of newTables) {
      if (!oldTables.has(tableName)) {
        changes.push({
          type: 'table_added',
          tableName,
          timestamp
        });
      }
    }

    // Check for removed tables
    for (const [tableName] of oldTables) {
      if (!newTables.has(tableName)) {
        changes.push({
          type: 'table_removed',
          tableName,
          timestamp
        });
      }
    }

    // Compare columns in existing tables
    for (const [tableName, newTable] of newTables) {
      const oldTable = oldTables.get(tableName);
      if (oldTable) {
        const columnChanges = this.compareTableColumns(tableName, oldTable, newTable, timestamp);
        changes.push(...columnChanges);
      }
    }

    return changes;
  }

  private compareTableColumns(tableName: string, oldTable: TableInfo, newTable: TableInfo, timestamp: Date): SchemaChange[] {
    const changes: SchemaChange[] = [];
    
    const oldColumns = new Map(oldTable.columns.map(c => [c.name, c]));
    const newColumns = new Map(newTable.columns.map(c => [c.name, c]));

    // Check for added columns
    for (const [columnName, column] of newColumns) {
      if (!oldColumns.has(columnName)) {
        changes.push({
          type: 'column_added',
          tableName,
          columnName,
          newValue: column,
          timestamp
        });
      }
    }

    // Check for removed columns
    for (const [columnName, column] of oldColumns) {
      if (!newColumns.has(columnName)) {
        changes.push({
          type: 'column_removed',
          tableName,
          columnName,
          oldValue: column,
          timestamp
        });
      }
    }

    // Check for modified columns
    for (const [columnName, newColumn] of newColumns) {
      const oldColumn = oldColumns.get(columnName);
      if (oldColumn && this.hasColumnChanged(oldColumn, newColumn)) {
        changes.push({
          type: 'column_modified',
          tableName,
          columnName,
          oldValue: oldColumn,
          newValue: newColumn,
          timestamp
        });
      }
    }

    return changes;
  }

  private hasColumnChanged(oldColumn: any, newColumn: any): boolean {
    return (
      oldColumn.type !== newColumn.type ||
      oldColumn.nullable !== newColumn.nullable ||
      oldColumn.primaryKey !== newColumn.primaryKey ||
      oldColumn.defaultValue !== newColumn.defaultValue
    );
  }

  async getSnapshotHistory(databaseId: number, limit: number = 10): Promise<SchemaSnapshot[]> {
    const key = `db-${databaseId}`;
    const snapshots = this.snapshots.get(key) || [];
    
    return snapshots
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getSchemaChanges(databaseId: number, since?: Date): Promise<SchemaChange[]> {
    const snapshots = await this.getSnapshotHistory(databaseId, 100);
    const changes: SchemaChange[] = [];

    for (let i = 1; i < snapshots.length; i++) {
      const newer = snapshots[i - 1];
      const older = snapshots[i];
      
      if (since && newer.timestamp < since) {
        break;
      }

      const snapshotChanges = await this.compareSchemas(databaseId, newer.schema);
      changes.push(...snapshotChanges);
    }

    return changes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private calculateChecksum(schema: SchemaInfo): string {
    // Simple checksum based on schema structure
    const schemaString = JSON.stringify(schema, Object.keys(schema).sort());
    let hash = 0;
    
    for (let i = 0; i < schemaString.length; i++) {
      const char = schemaString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  private generateVersion(timestamp: Date): string {
    return `v${timestamp.getFullYear()}.${(timestamp.getMonth() + 1).toString().padStart(2, '0')}.${timestamp.getDate().toString().padStart(2, '0')}-${timestamp.getHours().toString().padStart(2, '0')}${timestamp.getMinutes().toString().padStart(2, '0')}`;
  }

  async exportSnapshot(snapshotId: string): Promise<string | null> {
    for (const snapshots of this.snapshots.values()) {
      const snapshot = snapshots.find(s => s.id === snapshotId);
      if (snapshot) {
        return JSON.stringify(snapshot, null, 2);
      }
    }
    return null;
  }

  async importSnapshot(snapshotData: string): Promise<SchemaSnapshot | null> {
    try {
      const snapshot: SchemaSnapshot = JSON.parse(snapshotData);
      
      // Validate snapshot structure
      if (!snapshot.id || !snapshot.databaseId || !snapshot.schema) {
        throw new Error('Invalid snapshot format');
      }

      const key = `db-${snapshot.databaseId}`;
      if (!this.snapshots.has(key)) {
        this.snapshots.set(key, []);
      }
      
      this.snapshots.get(key)!.push(snapshot);
      console.log(`Schema snapshot imported: ${snapshot.id}`);
      
      return snapshot;
    } catch (error) {
      console.error('Failed to import snapshot:', error);
      return null;
    }
  }

  async generateSchemaDiff(snapshotId1: string, snapshotId2: string): Promise<SchemaChange[]> {
    let snapshot1: SchemaSnapshot | null = null;
    let snapshot2: SchemaSnapshot | null = null;

    // Find snapshots
    for (const snapshots of this.snapshots.values()) {
      for (const snapshot of snapshots) {
        if (snapshot.id === snapshotId1) snapshot1 = snapshot;
        if (snapshot.id === snapshotId2) snapshot2 = snapshot;
      }
    }

    if (!snapshot1 || !snapshot2) {
      throw new Error('One or both snapshots not found');
    }

    // Compare schemas
    const changes: SchemaChange[] = [];
    const oldSchema = snapshot1.schema;
    const newSchema = snapshot2.schema;
    const timestamp = new Date();

    // Use the same comparison logic as compareSchemas
    const oldTables = new Map(oldSchema.tables.map(t => [t.name, t]));
    const newTables = new Map(newSchema.tables.map(t => [t.name, t]));

    for (const [tableName, table] of newTables) {
      if (!oldTables.has(tableName)) {
        changes.push({
          type: 'table_added',
          tableName,
          timestamp
        });
      }
    }

    for (const [tableName] of oldTables) {
      if (!newTables.has(tableName)) {
        changes.push({
          type: 'table_removed',
          tableName,
          timestamp
        });
      }
    }

    for (const [tableName, newTable] of newTables) {
      const oldTable = oldTables.get(tableName);
      if (oldTable) {
        const columnChanges = this.compareTableColumns(tableName, oldTable, newTable, timestamp);
        changes.push(...columnChanges);
      }
    }

    return changes;
  }

  getStats(): { totalSnapshots: number; databaseCount: number; oldestSnapshot?: Date; newestSnapshot?: Date } {
    let totalSnapshots = 0;
    let oldestSnapshot: Date | undefined;
    let newestSnapshot: Date | undefined;

    for (const snapshots of this.snapshots.values()) {
      totalSnapshots += snapshots.length;
      
      for (const snapshot of snapshots) {
        if (!oldestSnapshot || snapshot.timestamp < oldestSnapshot) {
          oldestSnapshot = snapshot.timestamp;
        }
        if (!newestSnapshot || snapshot.timestamp > newestSnapshot) {
          newestSnapshot = snapshot.timestamp;
        }
      }
    }

    return {
      totalSnapshots,
      databaseCount: this.snapshots.size,
      oldestSnapshot,
      newestSnapshot
    };
  }
}