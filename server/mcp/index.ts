import { DatabaseConfig, QueryResult, SchemaInfo } from "../types/database.js";

export class MCPBroker {
  private servers: Map<string, McpServer> = new Map();
  private connections: Map<string, any> = new Map();

  async createDatabaseServer(config: DatabaseConfig): Promise<McpServer> {
    const serverName = `${config.type}-${config.id}`;
    
    if (this.servers.has(serverName)) {
      return this.servers.get(serverName)!;
    }

    const server = new McpServer({
      name: serverName,
      version: "1.0.0"
    });

    // Register database connection tool
    server.registerTool("connect", {
      title: `Connect to ${config.name}`,
      description: `Establish connection to ${config.type} database`,
      inputSchema: {
        type: "object",
        properties: {
          connectionString: { type: "string" },
          testQuery: { type: "string" }
        },
        required: ["connectionString"]
      }
    }, async ({ connectionString, testQuery }) => {
      try {
        const connection = await this.establishConnection(config.type, connectionString);
        this.connections.set(serverName, connection);
        
        let result = `Successfully connected to ${config.name}`;
        
        if (testQuery) {
          const queryResult = await this.executeQuery(connection, testQuery);
          result += `\nTest query executed: ${JSON.stringify(queryResult)}`;
        }

        return {
          content: [{
            type: "text",
            text: result
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: "text",
            text: `Connection failed: ${error.message}`
          }]
        };
      }
    });

    // Register query execution tool
    server.registerTool("execute-query", {
      title: "Execute SQL Query",
      description: `Execute SQL query on ${config.type} database`,
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          parameters: { type: "array", items: {} }
        },
        required: ["query"]
      }
    }, async ({ query, parameters }) => {
      try {
        const connection = this.connections.get(serverName);
        if (!connection) {
          throw new Error("Database not connected. Please connect first.");
        }

        const result = await this.executeQuery(connection, query, parameters);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: "text",
            text: `Query execution failed: ${error.message}`
          }]
        };
      }
    });

    // Register schema introspection tool
    server.registerTool("get-schema", {
      title: "Get Database Schema",
      description: `Retrieve schema information for ${config.type} database`,
      inputSchema: {
        type: "object",
        properties: {
          includeData: { type: "boolean", default: false }
        }
      }
    }, async ({ includeData = false }) => {
      try {
        const connection = this.connections.get(serverName);
        if (!connection) {
          throw new Error("Database not connected. Please connect first.");
        }

        const schema = await this.getSchema(connection, config.type, includeData);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(schema, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: "text",
            text: `Schema retrieval failed: ${error.message}`
          }]
        };
      }
    });

    this.servers.set(serverName, server);
    return server;
  }

  private async establishConnection(type: string, connectionString: string): Promise<any> {
    switch (type) {
      case "snowflake":
        return this.connectSnowflake(connectionString);
      case "databricks":
        return this.connectDatabricks(connectionString);
      case "sqlserver":
        return this.connectSqlServer(connectionString);
      case "salesforce":
        return this.connectSalesforce(connectionString);
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  private async connectSnowflake(connectionString: string): Promise<any> {
    // Mock implementation - replace with actual Snowflake connection
    return {
      type: "snowflake",
      connected: true,
      connectionString: connectionString.replace(/password=[^;]+/i, 'password=***')
    };
  }

  private async connectDatabricks(connectionString: string): Promise<any> {
    // Mock implementation - replace with actual Databricks connection
    return {
      type: "databricks",
      connected: true,
      connectionString: connectionString.replace(/password=[^;]+/i, 'password=***')
    };
  }

  private async connectSqlServer(connectionString: string): Promise<any> {
    // Mock implementation - replace with actual SQL Server connection
    return {
      type: "sqlserver",
      connected: true,
      connectionString: connectionString.replace(/password=[^;]+/i, 'password=***')
    };
  }

  private async connectSalesforce(connectionString: string): Promise<any> {
    // Mock implementation - replace with actual Salesforce connection
    return {
      type: "salesforce",
      connected: true,
      connectionString: connectionString.replace(/password=[^;]+/i, 'password=***')
    };
  }

  private async executeQuery(connection: any, query: string, parameters?: any[]): Promise<any> {
    // Mock implementation - replace with actual query execution
    return {
      rows: [
        { id: 1, name: "Sample Data", created_at: new Date().toISOString() },
        { id: 2, name: "Test Record", created_at: new Date().toISOString() }
      ],
      rowCount: 2,
      query: query,
      parameters: parameters
    };
  }

  private async getSchema(connection: any, type: string, includeData: boolean): Promise<any> {
    // Mock implementation - replace with actual schema introspection
    return {
      tables: [
        {
          name: "users",
          columns: [
            { name: "id", type: "INTEGER", nullable: false, primaryKey: true },
            { name: "name", type: "VARCHAR(255)", nullable: false },
            { name: "email", type: "VARCHAR(255)", nullable: false },
            { name: "created_at", type: "TIMESTAMP", nullable: false }
          ]
        },
        {
          name: "orders",
          columns: [
            { name: "id", type: "INTEGER", nullable: false, primaryKey: true },
            { name: "user_id", type: "INTEGER", nullable: false },
            { name: "total", type: "DECIMAL(10,2)", nullable: false },
            { name: "created_at", type: "TIMESTAMP", nullable: false }
          ]
        }
      ],
      views: [],
      procedures: [],
      includeData: includeData
    };
  }

  async getServer(serverName: string): Promise<McpServer | undefined> {
    return this.servers.get(serverName);
  }

  async disconnectAll(): Promise<void> {
    this.connections.forEach((connection, name) => {
      try {
        // Implement connection cleanup based on type
        console.log(`Disconnecting ${name}`);
      } catch (error) {
        console.error(`Error disconnecting ${name}:`, error);
      }
    });
    this.connections.clear();
    this.servers.clear();
  }
}

export const mcpBroker = new MCPBroker();