import { useQuery } from "@tanstack/react-query";
import { DatabaseIcon } from "@/lib/database-icons";
import type { Database } from "@shared/schema";

export function DatabaseConnections() {
  const { data: databases = [], isLoading } = useQuery<Database[]>({
    queryKey: ["/api/databases"],
  });

  if (isLoading) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Database Connections
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-2 rounded animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-1"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                </div>
                <div className="w-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Database Connections
      </h3>
      <div className="space-y-2">
        {databases.map((database) => (
          <div
            key={database.id}
            className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          >
            <DatabaseIcon type={database.type} />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{database.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{database.type}</div>
            </div>
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
        ))}
      </div>
    </div>
  );
}
