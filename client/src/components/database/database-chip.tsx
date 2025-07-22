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
      return "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed";
    }
    
    if (isSelected) {
      switch (database.type) {
        case "snowflake":
          return "bg-blue-50 border-blue-200 text-blue-800";
        case "databricks":
          return "bg-red-50 border-red-200 text-red-800";
        case "sqlserver":
          return "bg-blue-50 border-blue-200 text-blue-800";
        case "salesforce":
          return "bg-blue-50 border-blue-200 text-blue-800";
        default:
          return "bg-gray-50 border-gray-200 text-gray-800";
      }
    }
    
    return "bg-white border-gray-200 text-gray-700 hover:bg-gray-50";
  };

  return (
    <div
      className={`database-chip flex items-center space-x-2 border rounded-full px-3 py-1 text-sm cursor-pointer transition-all ${getChipColors()}`}
      onClick={database.status === "offline" ? undefined : onToggle}
    >
      <DatabaseIcon type={database.type} size="sm" />
      <span>{database.name}</span>
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
