# PromptELT - AI-Powered Database Communication & ETL Pipeline Builder

## Overview

PromptELT is an AI-powered application that enables users to communicate with multiple database types through natural language and build ETL/ELT pipelines. The application features a chat-based interface inspired by leading AI assistants (Claude, ChatGPT, Gemini) and supports various database connections including Snowflake, Databricks, SQL Server, and Salesforce.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack
- **Frontend**: React with TypeScript, Vite for bundling
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: TanStack Query for server state
- **Real-time Communication**: WebSocket support
- **Build Tools**: ESBuild for production builds

### Architecture Pattern
The application follows a monorepo structure with clearly separated client, server, and shared code:

```
├── client/         # React frontend application
├── server/         # Express.js backend API
├── shared/         # Shared types and schemas
└── attached_assets/ # Design specifications and assets
```

## Key Components

### Frontend Architecture
- **Component Library**: Shadcn/ui components built on Radix UI primitives
- **Styling System**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **UI Framework**: Modern component-driven architecture with TypeScript

### Backend Services
- **MCPBroker**: Manages MCP server communications and database connections
- **ClaudeService**: Handles AI-powered natural language query processing with Claude 4.0 Sonnet
- **SchemaSnapshotService**: Tracks database schema changes and maintains version history
- **QueryCache**: Intelligent caching layer with TTL and LRU eviction strategies

### Backend Architecture
- **API Layer**: RESTful Express.js server with TypeScript
- **Database Layer**: Drizzle ORM for type-safe database operations
- **Real-time Features**: WebSocket server for live updates
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **MCP Integration**: Model Context Protocol for database communications
- **AI Services**: Claude AI integration for natural language query processing
- **Caching Layer**: Query result caching with TTL and LRU eviction
- **Schema Management**: Automated schema snapshot and change tracking

### Database Schema
The application uses a well-structured PostgreSQL schema with the following core entities:
- **Users**: Authentication and user management
- **Databases**: Multiple database connection configurations
- **Conversations**: Chat history and context management
- **Messages**: Individual chat messages with metadata
- **Pipelines**: ETL/ELT pipeline definitions with hierarchical support
- **Pipeline Runs**: Execution history and status tracking

## Data Flow

### Chat Interface Flow
1. User types natural language query in chat interface
2. Selected database connections are included with the query
3. Backend processes the query and generates appropriate SQL
4. Results are returned and displayed in formatted tables
5. Conversation history is persisted for future reference

### Database Connection Flow
1. Database connections are configured with connection strings
2. Status monitoring shows online/offline/warning states
3. Database chips in chat interface allow multi-database queries
4. Connection health is tracked and displayed in real-time

### Pipeline Management Flow
1. Pipelines can be created through natural language conversation
2. Hierarchical pipeline structure supports complex ETL workflows
3. Pipeline execution is tracked with detailed run history
4. Scheduling support through cron expressions

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **wouter**: Lightweight routing for React
- **date-fns**: Date manipulation utilities
- **@anthropic-ai/sdk**: Claude AI integration for natural language processing
- **@modelcontextprotocol/sdk**: MCP server protocol for database communication

### Development Tools
- **Vite**: Fast development server and build tool
- **ESBuild**: Fast JavaScript bundler for production
- **TypeScript**: Type safety across the entire application
- **Tailwind CSS**: Utility-first CSS framework

### UI/UX Features
- **Real-time Updates**: WebSocket integration for live status updates
- **Code Highlighting**: SQL syntax highlighting in chat interface
- **Responsive Design**: Mobile-first responsive design
- **Accessibility**: Built on accessible Radix UI primitives
- **Theme Support**: CSS variables for easy theming

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React application to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations handle schema changes

### Environment Configuration
- **Development**: Uses Vite dev server with HMR
- **Production**: Serves static files through Express with optimized builds
- **Database**: Configurable through `DATABASE_URL` environment variable

### Scalability Considerations
- **Database**: Uses connection pooling for PostgreSQL
- **API**: Stateless Express server design for horizontal scaling
- **Storage**: Interface-based storage design allows easy migration from in-memory to persistent storage
- **Real-time**: WebSocket implementation ready for clustering with Redis adapter

The application is designed with modern development practices, emphasizing type safety, component reusability, and maintainable architecture patterns.