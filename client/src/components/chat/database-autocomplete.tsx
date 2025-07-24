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
    const search = searchTerm.toLowerCase();
    const name = db.name.toLowerCase();
    const type = db.type.toLowerCase();
    
    // Exact name match
    if (name.includes(search)) return true;
    
    // Type match  
    if (type.includes(search)) return true;
    
    // Shorthand matches for common databases
    if (search === 'sn' && type === 'snowflake') return true;
    if (search === 'sa' && type === 'salesforce') return true;
    if (search === 'ms' && type === 'mssql') return true;
    if (search === 'db' && type === 'databricks') return true;
    
    // Starting letters match (e.g., "snow" matches "snowflake-prod")
    if (name.startsWith(search)) return true;
    if (type.startsWith(search)) return true;
    
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

  // Debug output (remove after testing)
  console.log('Autocomplete render:', { isVisible, filteredCount: filteredDatabases.length, searchTerm });

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
          className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
            index === selectedIndex 
              ? 'bg-blue-50 dark:bg-blue-900/20' 
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
              {database.type} • Available shortcuts: @{database.type.slice(0,2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}