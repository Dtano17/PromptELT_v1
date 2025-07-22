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
    <div className={`w-64 bg-white border-r border-gray-200 flex flex-col ${isOpen ? 'block' : 'hidden lg:flex'}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {/* PromptELT Logo */}
          <div className="w-8 h-8 bg-promptelt-500 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              <path d="M20 4h2v16h-2z"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-900">PromptELT</span>
        </div>
        <Button className="w-full mt-3 bg-promptelt-500 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-promptelt-600 transition-colors flex items-center justify-center space-x-2">
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
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Free plan</span>
          <button className="text-promptelt-600 hover:text-promptelt-700">Upgrade</button>
        </div>
      </div>
    </div>
  );
}
