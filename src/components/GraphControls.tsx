import type { LayoutEngine } from '../types/graph.types';

interface GraphControlsProps {
  layoutEngine: LayoutEngine;
  onLayoutChange: (layoutEngine: LayoutEngine) => void;
  searchQuery: string;
  onSearchChange: (searchQuery: string) => void;
  highlightedNodeInfo?: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  showSuccessors: boolean;
  onToggleSuccessors: () => void;
}

const layoutOptions: { value: LayoutEngine; label: string; description: string }[] = [
  { value: 'dot', label: 'Top to Bottom', description: 'Hierarchical top-down layout' },
  { value: 'dot-lr', label: 'Left to Right', description: 'Hierarchical left-right layout' },
  { value: 'dot-rl', label: 'Right to Left', description: 'Hierarchical right-left layout' },
];

export default function GraphControls({
  layoutEngine,
  onLayoutChange,
  searchQuery,
  onSearchChange,
  highlightedNodeInfo,
  darkMode,
  onToggleDarkMode,
  showSuccessors,
  onToggleSuccessors,
}: GraphControlsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Bar */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="sr-only">
            Search nodes
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search nodes..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
          />
        </div>

        {/* Layout Selector */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="layout"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
          >
            Layout:
          </label>
          <select
            id="layout"
            value={layoutEngine}
            onChange={e => onLayoutChange(e.target.value as LayoutEngine)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
          >
            {layoutOptions.map(option => (
              <option key={option.value} value={option.value} title={option.description}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>Light</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
              <span>Dark</span>
            </>
          )}
        </button>

        {/* Predecessors/Successors Toggle */}
        <button
          onClick={onToggleSuccessors}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
          aria-label="Toggle between predecessors and successors"
        >
          {showSuccessors ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              <span>Successors</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              <span>Predecessors</span>
            </>
          )}
        </button>

        {/* Highlighted Node Info */}
        {highlightedNodeInfo && (
          <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md text-sm text-blue-800 dark:text-blue-200 transition-colors">
            {highlightedNodeInfo}
          </div>
        )}
      </div>
    </div>
  );
}
