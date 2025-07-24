export interface DatabaseConfig {
  id: number;
  name: string;
  type: 'snowflake' | 'databricks' | 'sqlserver' | 'salesforce';
  connectionString: string;
  status: 'online' | 'offline' | 'warning';
  description?: string;
  metadata?: Record<string, any>;
}

export interface QueryResult {
  rows: any[];
  rowCount: number;
  query: string;
  parameters?: any[];
  executionTime?: number;
}

export interface SchemaInfo {
  tables: TableInfo[];
  views: ViewInfo[];
  procedures: ProcedureInfo[];
  includeData: boolean;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  rowCount?: number;
  sampleData?: any[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  foreignKey?: boolean;
  defaultValue?: any;
}

export interface ViewInfo {
  name: string;
  definition: string;
  columns: ColumnInfo[];
}

export interface ProcedureInfo {
  name: string;
  parameters: ParameterInfo[];
  returnType?: string;
}

export interface ParameterInfo {
  name: string;
  type: string;
  direction: 'IN' | 'OUT' | 'INOUT';
  required: boolean;
}