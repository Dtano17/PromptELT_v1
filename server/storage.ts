import { 
  users, databases, conversations, messages, pipelines, pipelineRuns,
  type User, type InsertUser, type Database, type InsertDatabase,
  type Conversation, type InsertConversation, type Message, type InsertMessage,
  type Pipeline, type InsertPipeline, type PipelineRun, type InsertPipelineRun
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Databases
  getDatabase(id: number): Promise<Database | undefined>;
  getDatabasesByUserId(userId: number): Promise<Database[]>;
  createDatabase(database: InsertDatabase): Promise<Database>;
  updateDatabaseStatus(id: number, status: string): Promise<Database | undefined>;
  updateDatabase(id: number, updates: { alias?: string }): Promise<Database | undefined>;

  // Conversations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;

  // Messages
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Pipelines
  getPipeline(id: number): Promise<Pipeline | undefined>;
  getPipelinesByUserId(userId: number): Promise<Pipeline[]>;
  getPipelinesByParentId(parentId: number): Promise<Pipeline[]>;
  createPipeline(pipeline: InsertPipeline): Promise<Pipeline>;
  updatePipelineStatus(id: number, status: string): Promise<Pipeline | undefined>;

  // Pipeline Runs
  getPipelineRunsByPipelineId(pipelineId: number): Promise<PipelineRun[]>;
  createPipelineRun(run: InsertPipelineRun): Promise<PipelineRun>;
  updatePipelineRun(id: number, updates: Partial<PipelineRun>): Promise<PipelineRun | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private databases: Map<number, Database>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private pipelines: Map<number, Pipeline>;
  private pipelineRuns: Map<number, PipelineRun>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.databases = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.pipelines = new Map();
    this.pipelineRuns = new Map();
    this.currentId = 1;

    // Initialize with demo user and data
    this.initializeDemo();
  }

  private initializeDemo() {
    // Create demo user
    const demoUser: User = {
      id: this.currentId++,
      username: "demo",
      password: "demo123"
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo databases
    const snowflakeDb: Database = {
      id: this.currentId++,
      name: "snowflake-prod",
      alias: "snow-prod",
      type: "snowflake",
      connectionString: "snowflake://prod.account.snowflakecomputing.com",
      status: "online",
      userId: demoUser.id,
      createdAt: new Date()
    };
    this.databases.set(snowflakeDb.id, snowflakeDb);

    const databricksDb: Database = {
      id: this.currentId++,
      name: "databricks",
      alias: "databricks-main",
      type: "databricks",
      connectionString: "databricks://workspace.cloud.databricks.com",
      status: "online",
      userId: demoUser.id,
      createdAt: new Date()
    };
    this.databases.set(databricksDb.id, databricksDb);

    const sqlServerDb: Database = {
      id: this.currentId++,
      name: "mssql-server",
      alias: "sql-dev",
      type: "sqlserver",
      connectionString: "sqlserver://dev-server:1433/database",
      status: "online",
      userId: demoUser.id,
      createdAt: new Date()
    };
    this.databases.set(sqlServerDb.id, sqlServerDb);

    const salesforceDb: Database = {
      id: this.currentId++,
      name: "salesforce-crm",
      alias: "sf-crm",
      type: "salesforce",
      connectionString: "salesforce://na1.salesforce.com",
      status: "online",
      userId: demoUser.id,
      createdAt: new Date()
    };
    this.databases.set(salesforceDb.id, salesforceDb);

    // Create demo conversation
    const demoConversation: Conversation = {
      id: this.currentId++,
      title: "Customer data extraction pipeline",
      userId: demoUser.id,
      createdAt: new Date()
    };
    this.conversations.set(demoConversation.id, demoConversation);

    // Create demo pipelines
    const productionPipeline: Pipeline = {
      id: this.currentId++,
      name: "Production ETL",
      description: "Main production data pipeline",
      status: "active",
      schedule: "0 0 * * *",
      sourceDbId: snowflakeDb.id,
      targetDbId: databricksDb.id,
      configuration: { type: "ETL", steps: ["extract", "transform", "load"] },
      userId: demoUser.id,
      parentPipelineId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pipelines.set(productionPipeline.id, productionPipeline);

    // Child pipelines
    const customerSyncPipeline: Pipeline = {
      id: this.currentId++,
      name: "Customer Sync",
      description: "Sync customer data",
      status: "active",
      schedule: "0 */4 * * *",
      sourceDbId: snowflakeDb.id,
      targetDbId: databricksDb.id,
      configuration: { type: "ETL", table: "customers" },
      userId: demoUser.id,
      parentPipelineId: productionPipeline.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pipelines.set(customerSyncPipeline.id, customerSyncPipeline);

    const salesDataPipeline: Pipeline = {
      id: this.currentId++,
      name: "Sales Data",
      description: "Process sales data",
      status: "active",
      schedule: "0 */6 * * *",
      sourceDbId: salesforceDb.id,
      targetDbId: snowflakeDb.id,
      configuration: { type: "ELT", table: "sales" },
      userId: demoUser.id,
      parentPipelineId: productionPipeline.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pipelines.set(salesDataPipeline.id, salesDataPipeline);

    // Additional pipelines
    const snowflakeDatabricksMigration: Pipeline = {
      id: this.currentId++,
      name: "Snowflake Databricks Migration",
      description: "Migrate warehouse data to Databricks",
      status: "running",
      schedule: "0 2 * * *",
      sourceDbId: snowflakeDb.id,
      targetDbId: databricksDb.id,
      configuration: { type: "ETL", migration: "full_warehouse" },
      userId: demoUser.id,
      parentPipelineId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pipelines.set(snowflakeDatabricksMigration.id, snowflakeDatabricksMigration);

    const sqlServerChurnAnalysis: Pipeline = {
      id: this.currentId++,
      name: "SQL Server Churn Analysis Pipeline",
      description: "Customer churn analysis from SQL Server to Databricks",
      status: "active",
      schedule: "0 3 * * 1",
      sourceDbId: sqlServerDb.id,
      targetDbId: databricksDb.id,
      configuration: { type: "ETL", analysis: "customer_churn" },
      userId: demoUser.id,
      parentPipelineId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pipelines.set(sqlServerChurnAnalysis.id, sqlServerChurnAnalysis);

    const realTimeDataSync: Pipeline = {
      id: this.currentId++,
      name: "Real-time Data Sync",
      description: "Live data synchronization pipeline",
      status: "active",
      schedule: "*/15 * * * *",
      sourceDbId: salesforceDb.id,
      targetDbId: snowflakeDb.id,
      configuration: { type: "ELT", sync: "real_time" },
      userId: demoUser.id,
      parentPipelineId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pipelines.set(realTimeDataSync.id, realTimeDataSync);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDatabase(id: number): Promise<Database | undefined> {
    return this.databases.get(id);
  }

  async getDatabasesByUserId(userId: number): Promise<Database[]> {
    return Array.from(this.databases.values()).filter(db => db.userId === userId);
  }

  async createDatabase(insertDatabase: InsertDatabase): Promise<Database> {
    const id = this.currentId++;
    const database: Database = { 
      ...insertDatabase, 
      id, 
      status: "offline",
      createdAt: new Date() 
    };
    this.databases.set(id, database);
    return database;
  }

  async updateDatabase(id: number, updates: { alias?: string }): Promise<Database | undefined> {
    const database = this.databases.get(id);
    if (database) {
      if (updates.alias !== undefined) {
        database.alias = updates.alias;
      }
      this.databases.set(id, database);
      return database;
    }
    return undefined;
  }

  async updateDatabaseStatus(id: number, status: string): Promise<Database | undefined> {
    const database = this.databases.get(id);
    if (database) {
      database.status = status;
      this.databases.set(id, database);
    }
    return database;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentId++;
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      createdAt: new Date() 
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  async getPipeline(id: number): Promise<Pipeline | undefined> {
    return this.pipelines.get(id);
  }

  async getPipelinesByUserId(userId: number): Promise<Pipeline[]> {
    return Array.from(this.pipelines.values()).filter(pipeline => pipeline.userId === userId);
  }

  async getPipelinesByParentId(parentId: number): Promise<Pipeline[]> {
    return Array.from(this.pipelines.values()).filter(pipeline => pipeline.parentPipelineId === parentId);
  }

  async createPipeline(insertPipeline: InsertPipeline): Promise<Pipeline> {
    const id = this.currentId++;
    const pipeline: Pipeline = { 
      ...insertPipeline, 
      id, 
      status: "inactive",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pipelines.set(id, pipeline);
    return pipeline;
  }

  async updatePipelineStatus(id: number, status: string): Promise<Pipeline | undefined> {
    const pipeline = this.pipelines.get(id);
    if (pipeline) {
      pipeline.status = status;
      pipeline.updatedAt = new Date();
      this.pipelines.set(id, pipeline);
    }
    return pipeline;
  }

  async getPipelineRunsByPipelineId(pipelineId: number): Promise<PipelineRun[]> {
    return Array.from(this.pipelineRuns.values())
      .filter(run => run.pipelineId === pipelineId)
      .sort((a, b) => (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0));
  }

  async createPipelineRun(insertRun: InsertPipelineRun): Promise<PipelineRun> {
    const id = this.currentId++;
    const run: PipelineRun = { 
      ...insertRun, 
      id, 
      startTime: new Date()
    };
    this.pipelineRuns.set(id, run);
    return run;
  }

  async updatePipelineRun(id: number, updates: Partial<PipelineRun>): Promise<PipelineRun | undefined> {
    const run = this.pipelineRuns.get(id);
    if (run) {
      Object.assign(run, updates);
      this.pipelineRuns.set(id, run);
    }
    return run;
  }
}

export const storage = new MemStorage();
