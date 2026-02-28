import { useState } from 'react';
import type {
  GraphExportFormat,
  GraphExportOptions,
  GraphExportSource,
  LayoutEngine,
} from '../types/graph.types';
import ModuleFilter from './ModuleFilter';

interface GraphControlsProps {
  layoutEngine: LayoutEngine;
  onLayoutChange: (layoutEngine: LayoutEngine) => void;
  showSuccessors: boolean;
  onToggleSuccessors: () => void;
  ignoreDataNodes: boolean;
  onToggleIgnoreDataNodes: () => void;
  availableModules: string[];
  selectedModules: Set<string>;
  onModuleSelectionChange: (modules: Set<string>) => void;
  onExport: (options: GraphExportOptions) => void;
  exportDisabled?: boolean;
}

const layoutOptions: { value: LayoutEngine; label: string; description: string }[] = [
  { value: 'dot', label: 'Top to Bottom', description: 'Hierarchical top-down layout' },
  { value: 'dot-lr', label: 'Left to Right', description: 'Hierarchical left-right layout' },
  { value: 'dot-rl', label: 'Right to Left', description: 'Hierarchical right-left layout' },
];

export default function GraphControls({
  layoutEngine,
  onLayoutChange,
  showSuccessors,
  onToggleSuccessors,
  ignoreDataNodes,
  onToggleIgnoreDataNodes,
  availableModules,
  selectedModules,
  onModuleSelectionChange,
  onExport,
  exportDisabled = false,
}: GraphControlsProps) {
  const [exportFormat, setExportFormat] = useState<GraphExportFormat>('svg');
  const [exportSource, setExportSource] = useState<GraphExportSource>('current');
  const selectBase =
    'h-9 px-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors shadow-sm';
  const buttonGhost =
    'h-9 inline-flex items-center gap-2 rounded-md bg-gray-100 dark:bg-gray-700 px-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors';
  const buttonPrimary =
    'h-9 inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors';

  const handleExport = () => {
    onExport({ format: exportFormat, source: exportSource });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Module Filter */}
      <ModuleFilter
        availableModules={availableModules}
        selectedModules={selectedModules}
        onSelectionChange={onModuleSelectionChange}
      />

      {/* Layout Selector */}
      <div className="flex items-center gap-2">
        <select
          id="layout"
          value={layoutEngine}
          onChange={e => onLayoutChange(e.target.value as LayoutEngine)}
          aria-label="Layout"
          className={selectBase}
        >
          {layoutOptions.map(option => (
            <option key={option.value} value={option.value} title={option.description}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Export */}
      <div className="flex items-center gap-2">
        <select
          id="export-format"
          value={exportFormat}
          onChange={e => setExportFormat(e.target.value as GraphExportFormat)}
          aria-label="Export format"
          className={selectBase}
        >
          <option value="svg">SVG</option>
          <option value="png">PNG</option>
        </select>
        <select
          id="export-source"
          value={exportSource}
          onChange={e => setExportSource(e.target.value as GraphExportSource)}
          aria-label="Export source"
          className={selectBase}
        >
          <option value="current">Current</option>
          <option value="raw">Raw</option>
        </select>
        <button
          type="button"
          onClick={handleExport}
          disabled={exportDisabled}
          className={buttonPrimary}
        >
          Download
        </button>
      </div>

      {/* Predecessors/Successors Toggle */}
      <button
        onClick={onToggleSuccessors}
        className={`${buttonGhost} min-w-[132px]`}
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

      {/* Ignore data nodes */}
      <button
        onClick={onToggleIgnoreDataNodes}
        className={buttonGhost}
        aria-label="Toggle data nodes"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7h16M4 12h16M4 17h16"
          />
        </svg>
        <span className="min-w-[96px] text-left">
          {ignoreDataNodes ? 'Show data' : 'Ignore data'}
        </span>
      </button>
    </div>
  );
}
