import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { Conversation } from "@shared/schema";

export function QueryHistory() {
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  if (isLoading) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Query History
        </h3>
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-2 rounded animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Query History
      </h3>
      <div className="space-y-1">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
          >
            <div className="truncate">{conversation.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {conversation.createdAt ? formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true }) : "Unknown"}
            </div>
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 p-2">No conversations yet</div>
        )}
      </div>
    </div>
  );
}
