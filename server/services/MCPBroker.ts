import { DatabaseConfig, QueryResult, SchemaInfo } from '../types/database.js';
import { ClaudeService, ProcessQueryRequest } from './ClaudeService.js';
import { SchemaSnapshotService } from './SchemaSnapshotService.js';
import { QueryCache } from './QueryCache.js';

export interface MCPConnection {
  id: string;
  databaseId: number;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastActivity: Date;
  metadata: Record<string, any>;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
}

export class MCPBroker {
  private connections: Map<string, MCPConnection> = new Map();
  private claudeService: ClaudeService;
  private schemaService: SchemaSnapshotService;
  private queryCache: QueryCache;

  constructor() {
    this.claudeService = new ClaudeService();
    this.schemaService = new SchemaSnapshotService();
    this.queryCache = new QueryCache();
  }

  async connectDatabase(config: DatabaseConfig): Promise<MCPResponse> {
    const startTime = Date.now();
    const connectionId = `${config.type}-${config.id}`;

    try {
      // Mock connection establishment - replace with actual MCP server connection
      const connection: MCPConnection = {
        id: connectionId,
        databaseId: config.id,
        type: config.type,
        status: 'connected',
        lastActivity: new Date(),
        metadata: {
          name: config.name,
          connectionString: config.connectionString?.replace(/password=[^;]+/i, 'password=***') || 'mock://connection'
        }
      };

      this.connections.set(connectionId, connection);

      // Capture initial schema snapshot
      const mockSchema = await this.getMockSchema(config.type);
      await this.schemaService.captureSnapshot(config.id, mockSchema);

      const executionTime = Date.now() - startTime;
      console.log(`MCP connection established for ${config.name} (${config.type})`);

      return {
        success: true,
        data: {
          connectionId,
          status: 'connected',
          message: `Successfully connected to ${config.name}`
        },
        executionTime
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(`MCP connection failed for ${config.name}:`, error);

      return {
        success: false,
        error: `Connection failed: ${error.message}`,
        executionTime
      };
    }
  }

  async executeQuery(databaseId: number, query: string, parameters: any[] = []): Promise<MCPResponse> {
    const startTime = Date.now();
    const connectionId = this.getConnectionId(databaseId);

    try {
      // Check cache first
      const cachedResult = await this.queryCache.get(query, parameters, databaseId);
      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          executionTime: Date.now() - startTime
        };
      }

      // Mock query execution - replace with actual MCP server query
      const result = await this.executeMockQuery(query, parameters, databaseId);
      
      // Cache the result
      await this.queryCache.set(query, result, databaseId, parameters);

      // Update connection activity
      this.updateConnectionActivity(connectionId);

      const executionTime = Date.now() - startTime;
      result.executionTime = executionTime;

      return {
        success: true,
        data: result,
        executionTime
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(`Query execution failed for database ${databaseId}:`, error);

      return {
        success: false,
        error: `Query execution failed: ${error.message}`,
        executionTime
      };
    }
  }

  async processNaturalLanguageQuery(request: ProcessQueryRequest, apiKey?: string): Promise<MCPResponse> {
    const startTime = Date.now();

    try {
      // Get schema context for the databases
      const schemas: SchemaInfo[] = [];
      for (const dbId of request.databaseIds) {
        const snapshots = await this.schemaService.getSnapshotHistory(dbId, 1);
        if (snapshots.length > 0) {
          schemas.push(snapshots[0].schema);
        }
      }

      // Process with Claude
      const response = await this.claudeService.processNaturalLanguageQuery({
        ...request,
        schema: schemas
      }, apiKey);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: response,
        executionTime
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error('Natural language processing failed:', error);

      return {
        success: false,
        error: `Processing failed: ${error.message}`,
        executionTime
      };
    }
  }

  async getSchema(databaseId: number, includeData: boolean = false): Promise<MCPResponse> {
    const startTime = Date.now();

    try {
      const snapshots = await this.schemaService.getSnapshotHistory(databaseId, 1);
      let schema: SchemaInfo;

      if (snapshots.length > 0) {
        schema = snapshots[0].schema;
      } else {
        // Get fresh schema if no snapshots exist
        const connection = this.findConnection(databaseId);
        if (!connection) {
          throw new Error('Database not connected');
        }
        schema = await this.getMockSchema(connection.type);
        await this.schemaService.captureSnapshot(databaseId, schema);
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: schema,
        executionTime
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(`Schema retrieval failed for database ${databaseId}:`, error);

      return {
        success: false,
        error: `Schema retrieval failed: ${error.message}`,
        executionTime
      };
    }
  }

  async disconnectDatabase(databaseId: number): Promise<MCPResponse> {
    const startTime = Date.now();
    const connectionId = this.getConnectionId(databaseId);

    try {
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.status = 'disconnected';
        this.connections.delete(connectionId);
        
        // Invalidate cache for this database
        await this.queryCache.invalidate(undefined, databaseId);
        
        console.log(`MCP connection closed for database ${databaseId}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: { message: 'Database disconnected successfully' },
        executionTime
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      console.error(`Disconnection failed for database ${databaseId}:`, error);

      return {
        success: false,
        error: `Disconnection failed: ${error.message}`,
        executionTime
      };
    }
  }

  getConnectionStatus(databaseId: number): MCPConnection | null {
    return this.findConnection(databaseId);
  }

  getAllConnections(): MCPConnection[] {
    return Array.from(this.connections.values());
  }

  async getServiceStats() {
    return {
      connections: this.connections.size,
      cache: this.queryCache.getStats(),
      schema: this.schemaService.getStats(),
      uptime: process.uptime()
    };
  }

  private getConnectionId(databaseId: number): string {
    const connection = this.findConnection(databaseId);
    return connection ? connection.id : `unknown-${databaseId}`;
  }

  private findConnection(databaseId: number): MCPConnection | null {
    for (const connection of this.connections.values()) {
      if (connection.databaseId === databaseId) {
        return connection;
      }
    }
    return null;
  }

  private updateConnectionActivity(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
    }
  }

  private async getMockSchema(type: string): Promise<SchemaInfo> {
    // Mock schema based on database type - replace with actual schema introspection
    const baseSchema: SchemaInfo = {
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'INTEGER', nullable: false, primaryKey: true },
            { name: 'name', type: 'VARCHAR(255)', nullable: false },
            { name: 'email', type: 'VARCHAR(255)', nullable: false },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false }
          ]
        },
        {
          name: 'orders',
          columns: [
            { name: 'id', type: 'INTEGER', nullable: false, primaryKey: true },
            { name: 'user_id', type: 'INTEGER', nullable: false, foreignKey: true },
            { name: 'total', type: 'DECIMAL(10,2)', nullable: false },
            { name: 'status', type: 'VARCHAR(50)', nullable: false },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false }
          ]
        }
      ],
      views: [],
      procedures: [],
      includeData: false
    };

    // Customize schema based on database type
    switch (type) {
      case 'snowflake':
        baseSchema.tables.push({
          name: 'warehouse_analytics',
          columns: [
            { name: 'warehouse_id', type: 'VARCHAR(100)', nullable: false, primaryKey: true },
            { name: 'query_count', type: 'NUMBER(38,0)', nullable: false },
            { name: 'execution_time', type: 'NUMBER(38,3)', nullable: false },
            { name: 'date', type: 'DATE', nullable: false }
          ]
        });
        break;
      case 'databricks':
        baseSchema.tables.push({
          name: 'ml_models',
          columns: [
            { name: 'model_id', type: 'STRING', nullable: false, primaryKey: true },
            { name: 'model_name', type: 'STRING', nullable: false },
            { name: 'accuracy', type: 'DOUBLE', nullable: true },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false }
          ]
        });
        break;
      case 'salesforce':
        baseSchema.tables = [
          {
            name: 'Account',
            columns: [
              { name: 'Id', type: 'ID', nullable: false, primaryKey: true },
              { name: 'Name', type: 'STRING', nullable: false },
              { name: 'Industry', type: 'PICKLIST', nullable: true },
              { name: 'CreatedDate', type: 'DATETIME', nullable: false }
            ]
          },
          {
            name: 'Contact',
            columns: [
              { name: 'Id', type: 'ID', nullable: false, primaryKey: true },
              { name: 'FirstName', type: 'STRING', nullable: true },
              { name: 'LastName', type: 'STRING', nullable: false },
              { name: 'Email', type: 'EMAIL', nullable: true },
              { name: 'AccountId', type: 'REFERENCE', nullable: true, foreignKey: true }
            ]
          }
        ];
        break;
    }

    return baseSchema;
  }

  private async executeMockQuery(query: string, parameters: any[], databaseId: number): Promise<QueryResult> {
    // Mock query execution - replace with actual MCP server query execution
    const normalizedQuery = query.toLowerCase().trim();
    
    let mockRows: any[] = [];
    
    if (normalizedQuery.includes('select') && normalizedQuery.includes('users')) {
      mockRows = [
        { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15T10:30:00Z' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-16T14:22:00Z' }
      ];
    } else if (normalizedQuery.includes('select') && normalizedQuery.includes('orders')) {
      mockRows = [
        { id: 101, user_id: 1, total: 299.99, status: 'completed', created_at: '2024-01-20T09:15:00Z' },
        { id: 102, user_id: 2, total: 199.50, status: 'pending', created_at: '2024-01-21T16:45:00Z' }
      ];
    } else if (normalizedQuery.includes('count')) {
      mockRows = [{ count: 42 }];
    } else {
      mockRows = [{ result: 'Query executed successfully' }];
    }

    // Simulate execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    return {
      rows: mockRows,
      rowCount: mockRows.length,
      query,
      parameters,
      executionTime: Math.random() * 200 + 50
    };
  }

  async destroy(): Promise<void> {
    console.log('Shutting down MCP Broker...');
    
    // Disconnect all databases
    for (const connection of this.connections.values()) {
      await this.disconnectDatabase(connection.databaseId);
    }
    
    // Cleanup services
    this.queryCache.destroy();
    
    console.log('MCP Broker shutdown complete');
  }
}