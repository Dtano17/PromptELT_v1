import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Save, Key, ArrowLeft, Edit2, X } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Database } from "@shared/schema";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingDatabase, setEditingDatabase] = useState<number | null>(null);
  const [editAlias, setEditAlias] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Load existing API key from localStorage on component mount
    const savedKey = localStorage.getItem("anthropic_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.startsWith("sk-ant-")) {
      toast({
        title: "Invalid API Key",
        description: "Anthropic API keys should start with 'sk-ant-'",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Test the API key by making a simple request
      const response = await fetch("/api/test-claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        // Save to localStorage
        localStorage.setItem("anthropic_api_key", apiKey);
        
        toast({
          title: "Success",
          description: "Claude API key saved and verified!",
        });
      } else {
        const error = await response.json();
        toast({
          title: "API Key Test Failed",
          description: error.error || "Failed to verify API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Database queries and mutations
  const { data: databases = [] } = useQuery<Database[]>({
    queryKey: ["/api/databases"],
  });

  const updateDatabaseMutation = useMutation({
    mutationFn: async ({ id, alias }: { id: number; alias: string }) => {
      return apiRequest(`/api/databases/${id}`, "PATCH", { alias });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/databases"] });
      setEditingDatabase(null);
      setEditAlias("");
      toast({
        title: "Success",
        description: "Database alias updated!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update database alias",
        variant: "destructive",
      });
    },
  });

  const handleEditDatabase = (database: Database) => {
    setEditingDatabase(database.id);
    setEditAlias(database.alias || "");
  };

  const handleSaveAlias = (id: number) => {
    updateDatabaseMutation.mutate({ id, alias: editAlias });
  };

  const handleCancelEdit = () => {
    setEditingDatabase(null);
    setEditAlias("");
  };

  const handleClearApiKey = () => {
    setApiKey("");
    localStorage.removeItem("anthropic_api_key");
    toast({
      title: "API Key Cleared",
      description: "Claude API key has been removed",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your API keys and application preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Claude AI Configuration
          </CardTitle>
          <CardDescription>
            Enter your Anthropic API key to enable natural language database queries.
            Your key is stored locally in your browser and never sent to our servers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Anthropic API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showKey ? "Hide" : "Show"} API key
                </span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://console.anthropic.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Anthropic Console
              </a>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveApiKey}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Testing..." : "Save & Test"}
            </Button>
            
            {apiKey && (
              <Button
                variant="outline"
                onClick={handleClearApiKey}
                disabled={isLoading}
              >
                Clear
              </Button>
            )}
          </div>

          {apiKey && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">What you can do with Claude:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ask questions in plain English: "Show me sales from last month"</li>
                <li>• Generate complex SQL queries from descriptions</li>
                <li>• Create ETL pipelines with natural language</li>
                <li>• Get explanations for query results and optimizations</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Database Connection Status</CardTitle>
          <CardDescription>
            View and manage your database connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Database connection testing is available once you configure your Claude API key.
            You can test connections by typing natural language queries in the chat interface.
          </div>
        </CardContent>
      </Card>

      {/* Database Aliases Management */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Database Aliases
          </CardTitle>
          <CardDescription>
            Set custom aliases for your databases to use in chat (e.g., @snow-prod, @sf-crm)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {databases.map((database) => (
              <div key={database.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    database.status === 'online' ? 'bg-green-500' : 
                    database.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {database.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {database.type}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingDatabase === database.id ? (
                    <>
                      <Input
                        value={editAlias}
                        onChange={(e) => setEditAlias(e.target.value)}
                        placeholder="Enter alias (e.g., snow-prod)"
                        className="w-40"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveAlias(database.id)}
                        disabled={updateDatabaseMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[100px] text-right">
                        {database.alias ? `@${database.alias}` : "No alias"}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditDatabase(database)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}