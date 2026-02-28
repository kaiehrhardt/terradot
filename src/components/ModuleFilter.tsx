import { useCallback, useEffect, useRef, useState } from 'react';

interface ModuleFilterProps {
  availableModules: string[];
  selectedModules: Set<string>;
  onSelectionChange: (selectedModules: Set<string>) => void;
}

export default function ModuleFilter({
  availableModules,
  selectedModules,
  onSelectionChange,
}: ModuleFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggleModule = useCallback(
    (moduleName: string) => {
      const newSelection = new Set(selectedModules);
      if (newSelection.has(moduleName)) {
        newSelection.delete(moduleName);
      } else {
        newSelection.add(moduleName);
      }
      onSelectionChange(newSelection);
    },
    [selectedModules, onSelectionChange]
  );

  const handleSelectAll = useCallback(() => {
    onSelectionChange(new Set(availableModules));
  }, [availableModules, onSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    onSelectionChange(new Set());
  }, [onSelectionChange]);

  // Don't render if no modules are available
  if (availableModules.length === 0) {
    return null;
  }

  const allSelected = selectedModules.size === availableModules.length;
  const noneSelected = selectedModules.size === 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 px-3 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
        aria-label="Filter by modules"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span>
          Modules ({selectedModules.size}/{availableModules.length})
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-full w-max max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-[32rem] overflow-y-auto">
          {/* Header with select all/none buttons */}
          <div className="sticky top-0 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-3 py-2 flex gap-2">
            <button
              onClick={handleSelectAll}
              disabled={allSelected}
              className="flex-1 h-8 px-2 text-xs font-semibold rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              disabled={noneSelected}
              className="flex-1 h-8 px-2 text-xs font-semibold rounded-md bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Deselect All
            </button>
          </div>

          {/* Module list */}
          <div className="py-1">
            {availableModules.map(moduleName => {
              const isSelected = selectedModules.has(moduleName);
              return (
                <label
                  key={moduleName}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleModule(moduleName)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-nowrap">
                    module.{moduleName}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
