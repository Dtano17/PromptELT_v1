import { DatabaseIcon } from "@/lib/database-icons";
import type { Database } from "@shared/schema";

interface DatabaseChipProps {
  database: Database;
  isSelected: boolean;
  onToggle: () => void;
}

export function DatabaseChip({ database, isSelected, onToggle }: DatabaseChipProps) {
  const getChipColors = () => {
    if (database.status === "offline") {
      return "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed text-gray-500 dark:text-gray-400";
    }
    
    if (isSelected) {
      switch (database.type) {
        case "snowflake":
          return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200";
        case "databricks":
          return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200";
        case "sqlserver":
          return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200";
        case "salesforce":
          return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200";
        default:
          return "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200";
      }
    }
    
    return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700";
  };

  return (
    <div
      className={`database-chip flex items-center space-x-2 border rounded-full px-3 py-1 text-sm cursor-pointer transition-all ${getChipColors()}`}
      onClick={database.status === "offline" ? undefined : onToggle}
      title={`@${database.name} - ${database.status}`}
    >
      <DatabaseIcon type={database.type} size="sm" />
      <span>@{database.name}</span>
      <div
        className={`w-2 h-2 rounded-full status-dot ${
          database.status === "online"
            ? "online"
            : database.status === "offline"
            ? "offline"
            : "warning"
        }`}
      />
    </div>
  );
}
