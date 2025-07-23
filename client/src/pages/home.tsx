import { useState } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { useWebSocket } from "@/hooks/use-websocket";
import { useTheme } from "@/hooks/use-theme";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isConnected } = useWebSocket();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col">
        <ChatInterface 
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          isWebSocketConnected={isConnected}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      </div>
    </div>
  );
}
