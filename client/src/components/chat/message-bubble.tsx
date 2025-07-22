import { CodeBlock } from "@/components/ui/code-block";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message & { aiResponse?: any };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end message-fade-in">
        <div className="max-w-3xl bg-promptelt-500 text-white rounded-2xl px-4 py-3">
          <p>{message.content}</p>
        </div>
      </div>
    );
  }

  const aiResponse = message.aiResponse;

  return (
    <div className="flex justify-start message-fade-in">
      <div className="max-w-3xl bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <p className="text-gray-800 mb-4">{message.content}</p>
        
        {aiResponse?.sql && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Query:</h4>
            <CodeBlock code={aiResponse.sql} language="sql" />
          </div>
        )}

        {aiResponse?.results && aiResponse.results.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Query Results</h4>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md">
                  Table View
                </button>
                <button className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md">
                  Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-50 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    {Object.keys(aiResponse.results[0] || {}).map((key) => (
                      <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {aiResponse.results.map((row: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                      {Object.values(row).map((value: any, cellIndex: number) => (
                        <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900">
                          {typeof value === 'number' && value.toString().includes('.') 
                            ? `$${value.toFixed(2)}` 
                            : value?.toString() || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {aiResponse?.pipeline && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">🔄 ETL Pipeline Created</h4>
            <p className="text-sm text-blue-800 mb-3">{aiResponse.pipeline.name}</p>
            <div className="space-y-2">
              {aiResponse.pipeline.steps?.map((step: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-green-400' : 
                    index === 1 ? 'bg-yellow-400' : 'bg-blue-400'
                  }`}></div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                Schedule Pipeline
              </button>
              <button className="px-3 py-1 border border-blue-600 text-blue-600 text-xs rounded hover:bg-blue-50">
                View Pipeline
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
