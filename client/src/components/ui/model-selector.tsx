import { useState, useEffect, useRef } from "react";

const AI_MODELS = [
  { id: "claude-sonnet", name: "Claude Sonnet", provider: "Anthropic" },
  { id: "claude-haiku", name: "Claude Haiku", provider: "Anthropic" },
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
  { id: "llama-2", name: "Llama 2", provider: "Meta" },
];

interface ModelSelectorProps {
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

export function ModelSelector({ selectedModel = "claude-sonnet", onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleModelChange = (modelId: string) => {
    onModelChange?.(modelId);
    setIsOpen(false);
  };

  const model = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors"
      >
        <span>{model.name}</span>
        <svg width={12} height={12} viewBox="0 0 12 12" fill="currentColor">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          {AI_MODELS.map((modelOption) => (
            <button
              key={modelOption.id}
              onClick={() => handleModelChange(modelOption.id)}
              className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md transition-colors ${
                selectedModel === modelOption.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {modelOption.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {modelOption.provider}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}