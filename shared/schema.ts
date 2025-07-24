import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const databases = pgTable("databases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  alias: text("alias"), // User-friendly alias for @mentions
  type: text("type").notNull(), // 'snowflake', 'databricks', 'sqlserver', 'salesforce'
  connectionString: text("connection_string").notNull(),
  status: text("status").notNull().default("offline"), // 'online', 'offline', 'warning'
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  role: text("role").notNull(), // 'user', 'assistant'
  content: text("content").notNull(),
  metadata: json("metadata"), // query results, pipeline info, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const pipelines = pgTable("pipelines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("inactive"), // 'active', 'inactive', 'running', 'error'
  schedule: text("schedule"), // cron expression
  sourceDbId: integer("source_db_id").references(() => databases.id),
  targetDbId: integer("target_db_id").references(() => databases.id),
  configuration: json("configuration"), // ETL/ELT pipeline config
  userId: integer("user_id").references(() => users.id),
  parentPipelineId: integer("parent_pipeline_id").references(() => pipelines.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pipelineRuns = pgTable("pipeline_runs", {
  id: serial("id").primaryKey(),
  pipelineId: integer("pipeline_id").references(() => pipelines.id),
  status: text("status").notNull(), // 'running', 'success', 'failed'
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  logs: text("logs"),
  rowsProcessed: integer("rows_processed"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDatabaseSchema = createInsertSchema(databases).pick({
  name: true,
  alias: true,
  type: true,
  connectionString: true,
  userId: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  title: true,
  userId: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  role: true,
  content: true,
  metadata: true,
});

export const insertPipelineSchema = createInsertSchema(pipelines).pick({
  name: true,
  description: true,
  schedule: true,
  sourceDbId: true,
  targetDbId: true,
  configuration: true,
  userId: true,
  parentPipelineId: true,
});

export const insertPipelineRunSchema = createInsertSchema(pipelineRuns).pick({
  pipelineId: true,
  status: true,
  logs: true,
  rowsProcessed: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDatabase = z.infer<typeof insertDatabaseSchema>;
export type Database = typeof databases.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertPipeline = z.infer<typeof insertPipelineSchema>;
export type Pipeline = typeof pipelines.$inferSelect;
export type InsertPipelineRun = z.infer<typeof insertPipelineRunSchema>;
export type PipelineRun = typeof pipelineRuns.$inferSelect;
