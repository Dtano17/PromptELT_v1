import { useState, useRef, useEffect } from "react";
import { Database } from "@shared/schema";
import { DatabaseIcon } from "@/lib/database-icons";

interface DatabaseAutocompleteProps {
  databases: Database[];
  onSelect: (database: Database) => void;
  isVisible: boolean;
  position: { top: number; left: number };
  searchTerm: string;
}

export function DatabaseAutocomplete({ 
  databases, 
  onSelect, 
  isVisible, 
  position,
  searchTerm 
}: DatabaseAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredDatabases = databases.filter(db => {
    const search = searchTerm.toLowerCase().trim();
    const name = db.name.toLowerCase();
    const type = db.type.toLowerCase();
    
    // If no search term, show all
    if (!search) return true;
    
    // Exact name match
    if (name.includes(search)) return true;
    
    // Type match  
    if (type.includes(search)) return true;
    
    // Shorthand matches for common databases
    if (search === 'sn' && type === 'snowflake') return true;
    if (search === 'sa' && type === 'salesforce') return true;
    if (search === 'ms' && (type === 'mssql' || type === 'sqlserver')) return true;
    if (search === 'db' && type === 'databricks') return true;
    
    // Partial type matches (e.g., "snow" matches "snowflake")
    if (type.startsWith(search)) return true;
    if (name.startsWith(search)) return true;
    
    // Fuzzy matching for common typos
    if (search === 'snowf' && type === 'snowflake') return true;
    if (search === 'snowfl' && type === 'snowflake') return true;
    if (search === 'snowfla' && type === 'snowflake') return true;
    if (search === 'snowflak' && type === 'snowflake') return true;
    if (search === 'snoflake' && type === 'snowflake') return true; // common typo
    
    return false;
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredDatabases.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredDatabases.length - 1
          );
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (filteredDatabases[selectedIndex]) {
            onSelect(filteredDatabases[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, selectedIndex, filteredDatabases, onSelect]);



  if (!isVisible || filteredDatabases.length === 0) {
    return null;
  }

  return (
    <div 
      ref={listRef}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
      style={{ 
        top: position.top, 
        left: position.left,
        minWidth: '250px'
      }}
    >
      {filteredDatabases.map((database, index) => (
        <div
          key={database.id}
          className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
            index === selectedIndex 
              ? 'bg-blue-100 dark:bg-blue-900/30 border-l-2 border-blue-500' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          onClick={() => onSelect(database)}
        >
          <DatabaseIcon type={database.type} size="sm" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              @{database.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {database.type} • Try: @{database.type === 'snowflake' ? 'sn' : database.type === 'salesforce' ? 'sa' : database.type === 'databricks' ? 'db' : database.type === 'sqlserver' ? 'ms' : database.type.slice(0,2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}