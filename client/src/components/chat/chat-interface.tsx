import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Menu, Send, Paperclip, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "./message-bubble";
import { DatabaseChip } from "@/components/database/database-chip";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Database, Message } from "@shared/schema";

interface ChatInterfaceProps {
  onSidebarToggle: () => void;
  isWebSocketConnected: boolean;
}

export function ChatInterface({ onSidebarToggle, isWebSocketConnected }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [selectedDatabases, setSelectedDatabases] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<Message & { aiResponse?: any }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const { data: databases = [] } = useQuery<Database[]>({
    queryKey: ["/api/databases"],
  });

  const processMutation = useMutation({
    mutationFn: async (data: { query: string; databaseIds: number[] }) => {
      const response = await apiRequest("POST", "/api/process-query", data);
      return response.json();
    },
    onSuccess: (aiResponse) => {
      // Add AI response message
      const aiMessage: Message & { aiResponse: any } = {
        id: Date.now() + 1,
        conversationId: 1,
        role: "assistant",
        content: aiResponse.explanation,
        metadata: aiResponse,
        createdAt: new Date(),
        aiResponse
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleSend = async () => {
    if (!message.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      conversationId: 1,
      role: "user",
      content: message,
      metadata: { selectedDatabases },
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    const currentMessage = message;
    setMessage("");

    // Process with AI
    processMutation.mutate({
      query: currentMessage,
      databaseIds: selectedDatabases
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleDatabase = (dbId: number) => {
    setSelectedDatabases(prev => 
      prev.includes(dbId) 
        ? prev.filter(id => id !== dbId)
        : [...prev, dbId]
    );
  };

  const onlineDatabases = databases.filter(db => db.status === "online");
  const connectedCount = onlineDatabases.length;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={onSidebarToggle}
          >
            <Menu size={20} />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">PromptELT</h1>
          {isWebSocketConnected && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full status-dot online"></div>
              <span>Connected</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
            <Sun size={20} />
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {messages.length === 0 ? (
            /* Welcome Message */
            <div className="text-center mb-8">
              <div className="mb-4">
                {/* PromptELT Logo with Database to Brain concept */}
                <div className="inline-flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-promptelt-500 rounded-xl flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                      <path d="M20 4h2v16h-2z"/>
                    </svg>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="hsl(var(--promptelt-500))">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="hsl(var(--promptelt-500))">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3 0 1.66-1.34 3-3 3s-3-1.34-3-3c0-1.66 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to communicate with your databases?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Communicate with multiple database types as a single, cohesive system and build, scale and schedule ETL/ELT pipelines through natural language processing and AI-powered automation.
              </p>
            </div>
          ) : (
            /* Messages */
            <div className="space-y-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="max-w-3xl bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-promptelt-500"></div>
                      <span className="text-gray-600">Processing your request...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Connect Your Tools Section */}
          {messages.length === 0 && (
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-600 mb-4">Connected databases</p>
              <div className="flex items-center justify-center space-x-4">
                {databases.map((db) => (
                  <div
                    key={db.id}
                    className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer hover:scale-110 transition-transform ${
                      db.status === "online" ? "opacity-100" : "opacity-50"
                    }`}
                    style={{
                      backgroundColor: 
                        db.type === "snowflake" ? "hsl(var(--snowflake))" :
                        db.type === "databricks" ? "hsl(var(--databricks))" :
                        db.type === "sqlserver" ? "#0078d4" :
                        db.type === "salesforce" ? "#00a1e0" : "#6b7280"
                    }}
                    title={db.name}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      {db.type === "snowflake" && <path d="M12 2l3.09 6.26L22 9l-5.91 1.26L12 16l-4.09-5.74L2 9l6.91-0.74L12 2z"/>}
                      {db.type === "databricks" && <path d="M2 4h20v4H2V4zm0 6h20v4H2v-4zm0 6h20v4H2v-4z"/>}
                      {db.type === "sqlserver" && <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>}
                      {db.type === "salesforce" && <path d="M8.5 5.5c1.5-1.5 4-1.5 5.5 0 1 1 1.3 2.3.9 3.5 1.2-.4 2.6 0 3.5.9 1.5 1.5 1.5 4 0 5.5z"/>}
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          {/* Database Selection Chips */}
          <div className="flex items-center space-x-2 mb-3 flex-wrap gap-2">
            {onlineDatabases.map((database) => (
              <DatabaseChip
                key={database.id}
                database={database}
                isSelected={selectedDatabases.includes(database.id)}
                onToggle={() => toggleDatabase(database.id)}
              />
            ))}
          </div>

          {/* Input Field */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-promptelt-500 focus:border-transparent placeholder-gray-500"
              placeholder="Ask about your databases or describe an ETL pipeline..."
              rows={3}
              disabled={isProcessing}
            />
            
            {/* Input Actions */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Paperclip size={20} />
              </Button>
              <Button 
                onClick={handleSend}
                disabled={!message.trim() || isProcessing}
                className="p-2 bg-promptelt-500 text-white rounded-lg hover:bg-promptelt-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>

          {/* Input Footer */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>PromptELT Sonnet 4</span>
              <span>•</span>
              <span>Connected: {connectedCount}/{databases.length} databases</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Press ⌘↵ to send</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
