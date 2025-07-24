import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, Search, Library, History, X, Settings } from "lucide-react";
import { DatabaseConnections } from "./database-connections";
import { QueryHistory } from "./query-history";
import { Pipelines } from "./pipelines";
import { Logo } from "@/components/ui/logo";
import { Link } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const popularHints = [
  "Create a ETL migration pipeline from Oracle database to Databricks applying best practices",
  "Set up real-time data sync between Salesforce and Snowflake",
  "Build a data quality monitoring pipeline with automated alerts",
  "Design a multi-source data warehouse consolidation strategy",
  "Implement CDC (Change Data Capture) from SQL Server to BigQuery"
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <div className={`${isOpen ? 'w-80' : 'w-16'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${isOpen ? 'block' : 'hidden lg:flex'}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          {isOpen && <Logo size="lg" />}
          {!isOpen && (
            <div className="w-8 h-8 flex items-center justify-center">
              <Logo size="sm" />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isOpen ? <ChevronLeft size={16} /> : <Plus size={16} />}
          </Button>
        </div>
        {isOpen && (
          <Button className="w-full bg-promptelt-500 hover:bg-promptelt-600 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center space-x-2 shadow-sm">
            <Plus size={16} />
            <span>New Pipeline Chat</span>
          </Button>
        )}
      </div>

      {/* Popular Hints - Only show when sidebar is open */}
      {isOpen && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Popular Hints</h3>
          <div className="space-y-2">
            {popularHints.slice(0, 3).map((hint, index) => (
              <button
                key={index}
                className="w-full text-left text-xs text-gray-600 dark:text-gray-400 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors line-clamp-2"
                title={hint}
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        {isOpen ? (
          <div className="p-4 space-y-6">
            {/* Search Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                <Search size={16} />
                <span>Search Chats</span>
              </h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-promptelt-500"
                />
              </div>
            </div>

            {/* History Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                <History size={16} />
                <span>History</span>
              </h3>
              <QueryHistory />
            </div>

            {/* Library Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                <Library size={16} />
                <span>Library</span>
              </h3>
              <Pipelines />
            </div>

            <DatabaseConnections />
          </div>
        ) : (
          <div className="p-2 space-y-4">
            <button
              className="w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              title="Search Chats"
            >
              <Search size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              className="w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              title="History"
            >
              <History size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              className="w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              title="Library"
            >
              <Library size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
      </nav>

      {/* Sidebar Footer */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/settings">
            <Button
              variant="ghost"
              className="w-full justify-start mb-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
          </Link>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Free plan</span>
            <button className="text-promptelt-600 hover:text-promptelt-700 dark:text-promptelt-400 dark:hover:text-promptelt-300">Upgrade</button>
          </div>
        </div>
      )}

      {/* Collapsed Settings Button */}
      {!isOpen && (
        <div className="p-2">
          <Link href="/settings">
            <button
              className="w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              title="Settings"
            >
              <Settings size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
