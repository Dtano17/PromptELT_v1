import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Save, Key } from "lucide-react";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    </div>
  );
}