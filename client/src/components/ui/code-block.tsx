import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./button";

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="code-block bg-slate-900 dark:bg-slate-800 text-slate-200 dark:text-slate-100 p-4 relative rounded-lg">
      <Button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 bg-slate-700 dark:bg-slate-600 text-slate-300 dark:text-slate-200 border-none px-2 py-1 rounded text-xs cursor-pointer transition-colors duration-200 hover:bg-slate-600 dark:hover:bg-slate-500"
        size="sm"
        variant="ghost"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "Copied!" : "Copy"}
      </Button>
      <pre className="text-sm overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
