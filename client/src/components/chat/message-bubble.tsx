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
      <div className="max-w-3xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl p-6 shadow-md">
        <p className="text-gray-900 dark:text-gray-100 mb-4">{message.content}</p>
        
        {aiResponse?.connectionHelp && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center">
              🔗 Connection Guide
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-line leading-relaxed">
              {typeof aiResponse.connectionHelp === 'string' 
                ? aiResponse.connectionHelp 
                : (
                  <div className="space-y-4">
                    {Object.entries(aiResponse.connectionHelp).map(([key, value]) => (
                      <div key={key} className="border-l-2 border-blue-300 pl-3">
                        <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">{key}:</div>
                        <div className="text-blue-600 dark:text-blue-300">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}
        
        {aiResponse?.sql && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Generated Query:</h4>
            <CodeBlock code={aiResponse.sql} language="sql" />
          </div>
        )}

        {aiResponse?.results && aiResponse.results.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Query Results</h4>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md">
                  Table View
                </button>
                <button className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-50 dark:bg-gray-700 rounded-lg">
                <thead className="bg-gray-100 dark:bg-gray-600">
                  <tr>
                    {Object.keys(aiResponse.results[0] || {}).map((key) => (
                      <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {aiResponse.results.map((row: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? "" : "bg-gray-50 dark:bg-gray-800"}>
                      {Object.values(row).map((value: any, cellIndex: number) => (
                        <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200">
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

        {aiResponse?.followUpQuestions && aiResponse.followUpQuestions.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              💭 What would you like to know next?
            </h4>
            <div className="space-y-2">
              {aiResponse.followUpQuestions.map((question: string, index: number) => (
                <button 
                  key={index}
                  className="block w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded transition-colors"
                  onClick={() => {
                    // Add the question to the input
                    const event = new CustomEvent('addToInput', { detail: question });
                    document.dispatchEvent(event);
                  }}
                >
                  → {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {aiResponse?.pipeline && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">🔄 ETL Pipeline Created</h4>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">{aiResponse.pipeline.name}</p>
            <div className="space-y-2">
              {aiResponse.pipeline.steps?.map((step: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
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
              <button className="px-3 py-1 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 text-xs rounded hover:bg-blue-50 dark:hover:bg-blue-900/30">
                View Pipeline
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
