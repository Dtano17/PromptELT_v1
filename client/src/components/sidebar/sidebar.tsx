import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DatabaseConnections } from "./database-connections";
import { QueryHistory } from "./query-history";
import { Pipelines } from "./pipelines";
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen }: SidebarProps) {
  return (
    <div className={`w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${isOpen ? 'block' : 'hidden lg:flex'}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button className="w-full bg-promptelt-500 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-promptelt-600 transition-colors flex items-center justify-center space-x-2">
          <Plus size={16} />
          <span>New Pipeline Chat</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <QueryHistory />
        <Pipelines />
        <DatabaseConnections />
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Free plan</span>
          <button className="text-promptelt-600 hover:text-promptelt-700 dark:text-promptelt-400 dark:hover:text-promptelt-300">Upgrade</button>
        </div>
      </div>
    </div>
  );
}
