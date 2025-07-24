import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Menu, Send, Paperclip, Sun, Moon, Upload, Mic, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "./message-bubble";
import { DatabaseChip } from "@/components/database/database-chip";
import { DatabaseAutocomplete } from "./database-autocomplete";
import { DatabaseIcon } from "@/lib/database-icons";
import { ModelSelector } from "@/components/ui/model-selector";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/logo";
import type { Database, Message } from "@shared/schema";
import type { Theme } from "@/hooks/use-theme";

interface ChatInterfaceProps {
  onSidebarToggle: () => void;
  isWebSocketConnected: boolean;
  theme: Theme;
  onThemeToggle: () => void;
}

interface ConnectionStatusProps {
  status: "online" | "offline" | "warning";
  size?: "sm" | "md";
}

function ConnectionStatus({ status, size = "sm" }: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "warning":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  const dotSize = size === "sm" ? "w-2 h-2" : "w-3 h-3";

  return (
    <div className={`${dotSize} rounded-full ${getStatusColor()}`} />
  );
}

export function ChatInterface({ onSidebarToggle, isWebSocketConnected, theme, onThemeToggle }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [selectedDatabases, setSelectedDatabases] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<Message & { aiResponse?: any }>>([]);
  const [selectedModel, setSelectedModel] = useState("claude-sonnet");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const [autocompleteSearchTerm, setAutocompleteSearchTerm] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const { data: databases = [] } = useQuery<Database[]>({
    queryKey: ["/api/databases"],
  });

  const processMutation = useMutation({
    mutationFn: async (data: { query: string; databaseIds: number[] }) => {
      // Get API key from localStorage
      const apiKey = localStorage.getItem("anthropic_api_key");
      const response = await apiRequest("POST", "/api/process-query", { ...data, apiKey });
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

  // Handle @ autocomplete
  const handleMessageChange = (value: string) => {
    setMessage(value);
    
    // Find the last @ symbol and check if we should show autocomplete
    const lastAtIndex = value.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      // No @ symbol found
      setShowAutocomplete(false);
      return;
    }
    
    // Get text after the last @
    const afterAt = value.substring(lastAtIndex + 1);
    
    // Check if there's a space after @, which means we've finished typing the database name
    if (afterAt.includes(' ')) {
      setShowAutocomplete(false);
      return;
    }
    
    // Show autocomplete and filter by the text after @
    setAutocompleteSearchTerm(afterAt);
    setShowAutocomplete(true);
    updateAutocompletePosition();
    

  };

  const updateAutocompletePosition = () => {
    if (textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setAutocompletePosition({
        top: rect.bottom + scrollTop + 4,
        left: rect.left
      });
    }
  };

  const handleDatabaseSelect = (database: Database) => {
    const atIndex = message.lastIndexOf('@');
    const beforeAt = message.substring(0, atIndex);
    const newMessage = `${beforeAt}@${database.name} `;
    setMessage(newMessage);
    setShowAutocomplete(false);
    
    // Add to selected databases if not already selected
    if (!selectedDatabases.includes(database.id)) {
      setSelectedDatabases(prev => [...prev, database.id]);
    }
    
    // Focus back to textarea
    textareaRef.current?.focus();
  };

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
    setShowAutocomplete(false);

    // Process with AI
    processMutation.mutate({
      query: currentMessage,
      databaseIds: selectedDatabases
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // If autocomplete is showing, handle navigation
    if (showAutocomplete) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowAutocomplete(false);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        // Tab will be handled by the autocomplete component
        return;
      }
      // Let the autocomplete component handle arrow keys and enter
      return;
    }
    
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

  useEffect(() => {
    const handleAddToInput = (event: CustomEvent) => {
      setMessage(event.detail);
      setShowAutocomplete(false);
      textareaRef.current?.focus();
    };

    document.addEventListener('addToInput', handleAddToInput as EventListener);
    return () => document.removeEventListener('addToInput', handleAddToInput as EventListener);
  }, []);

  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={onSidebarToggle}
          >
            <Menu size={20} className="text-gray-700 dark:text-gray-200" />
          </Button>
          <div className="flex items-center space-x-3">
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </div>
          {isWebSocketConnected && (
            <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full status-dot online"></div>
              <span>Connected</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            onClick={onThemeToggle}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
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
                {/* PromptELT Logo */}
                <div className="inline-flex items-center space-x-3 mb-4">
                  <Logo size="xl" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to communicate with your databases?</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Ready to communicate with multiple database types as a single, cohesive system and build, scale and schedule ETL/ELT pipelines among database through natural language processing and AI-powered automation.
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Connected databases</p>
              <div className="flex items-center justify-center space-x-4">
                {databases.map((db) => (
                  <div
                    key={db.id}
                    className={`relative w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform ${
                      db.status === "online" ? "opacity-100" : "opacity-50"
                    } ${selectedDatabases.includes(db.id) ? "ring-2 ring-blue-500" : ""}`}
                    title={`${db.name} - ${db.status}`}
                    onClick={() => toggleDatabase(db.id)}
                  >
                    <DatabaseIcon type={db.type} size="lg" />
                    <div className="absolute -bottom-1 -right-1">
                      <ConnectionStatus status={db.status as "online" | "offline" | "warning"} size="md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
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
              onChange={(e) => handleMessageChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full resize-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-promptelt-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={selectedDatabases.length > 0 
                ? `Ask ${databases.filter(db => selectedDatabases.includes(db.id)).map(db => `@${db.name}`).join(', ')} about your data... (Type @ to mention databases)`
                : "Ask about your databases or describe an ETL pipeline... (Type @ to mention databases)"
              }
              rows={3}
              disabled={isProcessing}
            />
            
            {/* Database Autocomplete */}
            <DatabaseAutocomplete
              databases={databases}
              onSelect={handleDatabaseSelect}
              isVisible={showAutocomplete}
              position={autocompletePosition}
              searchTerm={autocompleteSearchTerm}
            />
            
            {/* Input Actions */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600" title="Upload file">
                <Upload size={18} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600" title="Voice input">
                <Mic size={18} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600" title="Attach file">
                <Paperclip size={18} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600" title="Tools">
                <Settings size={18} />
              </Button>
              <Button 
                onClick={handleSend}
                disabled={!message.trim() || isProcessing}
                className="p-2 bg-promptelt-500 text-white rounded-lg hover:bg-promptelt-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>

          {/* Input Footer */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>{selectedModel.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              <span>•</span>
              <span>Connected: {connectedCount}/{databases.length} databases</span>
              {selectedDatabases.length > 0 && (
                <>
                  <span>•</span>
                  <span>Selected: {selectedDatabases.length} database{selectedDatabases.length !== 1 ? 's' : ''}</span>
                </>
              )}
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
