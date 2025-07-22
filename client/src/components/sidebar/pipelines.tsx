import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { Pipeline } from "@shared/schema";

export function Pipelines() {
  const [expandedPipelines, setExpandedPipelines] = useState<Set<number>>(new Set());
  
  const { data: pipelines = [], isLoading } = useQuery<Pipeline[]>({
    queryKey: ["/api/pipelines"],
  });

  const togglePipeline = (pipelineId: number) => {
    const newExpanded = new Set(expandedPipelines);
    if (newExpanded.has(pipelineId)) {
      newExpanded.delete(pipelineId);
    } else {
      newExpanded.add(pipelineId);
    }
    setExpandedPipelines(newExpanded);
  };

  const getChildPipelines = (parentId: number) => {
    return pipelines.filter(p => p.parentPipelineId === parentId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "running":
        return "text-blue-500";
      case "error":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  const rootPipelines = pipelines.filter(p => !p.parentPipelineId);

  if (isLoading) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Pipelines
        </h3>
        <div className="space-y-1">
          {[1, 2].map((i) => (
            <div key={i} className="p-2 rounded animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="ml-4 space-y-1">
                <div className="h-2 bg-gray-200 rounded w-20"></div>
                <div className="h-2 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Pipelines
      </h3>
      <div className="space-y-1">
        {rootPipelines.map((pipeline) => {
          const children = getChildPipelines(pipeline.id);
          const isExpanded = expandedPipelines.has(pipeline.id);
          
          return (
            <div key={pipeline.id} className="pipeline-node">
              <div 
                className="p-2 rounded cursor-pointer flex items-center space-x-2"
                onClick={() => togglePipeline(pipeline.id)}
              >
                {children.length > 0 && (
                  <button className="p-0 h-auto">
                    {isExpanded ? (
                      <ChevronDown size={12} />
                    ) : (
                      <ChevronRight size={12} />
                    )}
                  </button>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-700 flex-1">
                  <svg width="12" height="12" fill="currentColor" className={getStatusColor(pipeline.status)}>
                    <circle cx="6" cy="6" r="6"/>
                  </svg>
                  <span>{pipeline.name}</span>
                </div>
              </div>
              
              {isExpanded && children.length > 0 && (
                <div className="cascading-item mt-1 space-y-1">
                  {children.map((child) => (
                    <div 
                      key={child.id}
                      className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer p-1 rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-2">
                        <svg width="8" height="8" fill="currentColor" className={getStatusColor(child.status)}>
                          <circle cx="4" cy="4" r="4"/>
                        </svg>
                        <span>├ {child.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {rootPipelines.length === 0 && (
          <div className="text-sm text-gray-500 p-2">No pipelines yet</div>
        )}
      </div>
    </div>
  );
}
