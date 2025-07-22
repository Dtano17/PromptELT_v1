import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import { insertMessageSchema, insertConversationSchema, insertPipelineSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Demo user ID for development
  const DEMO_USER_ID = 1;

  // API Routes
  
  // Get databases
  app.get("/api/databases", async (req, res) => {
    try {
      const databases = await storage.getDatabasesByUserId(DEMO_USER_ID);
      res.json(databases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch databases" });
    }
  });

  // Get conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversationsByUserId(DEMO_USER_ID);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getMessagesByConversationId(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Create a new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const data = insertConversationSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      const conversation = await storage.createConversation(data);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ error: "Invalid conversation data" });
    }
  });

  // Send a message
  app.post("/api/messages", async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(data);
      
      // Broadcast message to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "new_message",
            data: message
          }));
        }
      });
      
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Get pipelines
  app.get("/api/pipelines", async (req, res) => {
    try {
      const pipelines = await storage.getPipelinesByUserId(DEMO_USER_ID);
      res.json(pipelines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pipelines" });
    }
  });

  // Get child pipelines
  app.get("/api/pipelines/:id/children", async (req, res) => {
    try {
      const parentId = parseInt(req.params.id);
      const children = await storage.getPipelinesByParentId(parentId);
      res.json(children);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch child pipelines" });
    }
  });

  // Create a new pipeline
  app.post("/api/pipelines", async (req, res) => {
    try {
      const data = insertPipelineSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      const pipeline = await storage.createPipeline(data);
      
      // Broadcast pipeline update to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "pipeline_created",
            data: pipeline
          }));
        }
      });
      
      res.json(pipeline);
    } catch (error) {
      res.status(400).json({ error: "Invalid pipeline data" });
    }
  });

  // Update pipeline status
  app.patch("/api/pipelines/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const pipeline = await storage.updatePipelineStatus(id, status);
      
      if (!pipeline) {
        return res.status(404).json({ error: "Pipeline not found" });
      }
      
      // Broadcast status update to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "pipeline_status_updated",
            data: pipeline
          }));
        }
      });
      
      res.json(pipeline);
    } catch (error) {
      res.status(500).json({ error: "Failed to update pipeline status" });
    }
  });

  // Simulate AI query processing
  app.post("/api/process-query", async (req, res) => {
    try {
      const { query, databaseIds } = req.body;
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock AI response based on query content
      let response = {
        sql: "",
        explanation: "",
        results: [],
        pipeline: null
      };

      if (query.toLowerCase().includes("pipeline") || query.toLowerCase().includes("etl")) {
        response = {
          sql: `-- Generated ETL Pipeline
SELECT 
    customer_id,
    SUM(order_amount) as total_spent,
    COUNT(*) as order_count
FROM orders 
WHERE created_date >= '2024-01-01'
GROUP BY customer_id;`,
          explanation: "I've created an ETL pipeline to analyze customer spending patterns across your selected databases.",
          results: [
            { customer_id: "CUST_001", total_spent: 2500.00, order_count: 15 },
            { customer_id: "CUST_002", total_spent: 1800.50, order_count: 12 }
          ],
          pipeline: {
            name: "Customer Analysis Pipeline",
            steps: ["Extract customer data", "Transform spending metrics", "Load to analytics DB"],
            schedule: "Daily at 2 AM"
          }
        };
      } else {
        response = {
          sql: `-- Generated Query
SELECT * FROM customers 
WHERE status = 'active' 
ORDER BY created_date DESC 
LIMIT 100;`,
          explanation: "Here's a query to retrieve your active customers based on your request.",
          results: [
            { id: 1, name: "John Doe", status: "active", created_date: "2024-01-15" },
            { id: 2, name: "Jane Smith", status: "active", created_date: "2024-01-14" }
          ],
          pipeline: null
        };
      }

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Failed to process query" });
    }
  });

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send initial database status
    ws.send(JSON.stringify({
      type: "database_status",
      data: "Connected to PromptELT WebSocket"
    }));

    // Simulate periodic database status updates
    const statusInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "database_status_update",
          data: {
            timestamp: new Date().toISOString(),
            databases: [
              { id: 1, status: "online" },
              { id: 2, status: "online" },
              { id: 3, status: Math.random() > 0.7 ? "offline" : "online" },
              { id: 4, status: "online" }
            ]
          }
        }));
      }
    }, 30000); // Update every 30 seconds

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clearInterval(statusInterval);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(statusInterval);
    });
  });

  return httpServer;
}
