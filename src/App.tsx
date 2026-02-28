import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GraphViewer from './components/GraphViewer';
import DotInputEditor from './components/DotInputEditor';
import GraphControls from './components/GraphControls';
import ResizablePanels from './components/ResizablePanels';
import {
  findAllAncestors,
  findAllSuccessors,
  findRootNodes,
  parseDotString,
  extractModules,
  filterGraphByModules,
  filterGraphByDataNodes,
  graphDataToDotString,
} from './utils/graphParser';
import { EXAMPLE_GRAPH } from './utils/examples';
import type { GraphExportOptions, LayoutEngine } from './types/graph.types';

function App() {
  const [dotString, setDotString] = useState(EXAMPLE_GRAPH);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [layoutEngine, setLayoutEngine] = useState<LayoutEngine>('dot-lr');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessors, setShowSuccessors] = useState(false);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [ignoreDataNodes, setIgnoreDataNodes] = useState(false);
  const graphRenderStartRef = useRef<(() => void) | null>(null);
  const graphExportRef = useRef<((options: GraphExportOptions) => void) | null>(null);
  const [graphReady, setGraphReady] = useState(false);

  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle dark mode
  const handleToggleDarkMode = useCallback(() => {
    setDarkMode((prev: boolean) => !prev);
  }, []);

  // Toggle between ancestors and successors
  const handleToggleSuccessors = useCallback(() => {
    setShowSuccessors((prev: boolean) => !prev);
  }, []);

  // Debounce DOT string parsing
  const graphData = useMemo(() => {
    try {
      return parseDotString(dotString);
    } catch (err) {
      console.error('Error parsing DOT string:', err);
      return { nodes: new Map(), edges: [], adjacencyList: new Map() };
    }
  }, [dotString]);

  // Extract available modules from the graph
  const availableModules = useMemo(() => {
    return extractModules(graphData);
  }, [graphData]);

  // Initialize selected modules when available modules change
  useEffect(() => {
    // Select all modules by default
    setSelectedModules(new Set(availableModules));
  }, [availableModules]);

  // Filter graph data based on selected modules
  const filteredGraphData = useMemo(() => {
    const moduleFiltered = filterGraphByModules(graphData, selectedModules, availableModules);
    return filterGraphByDataNodes(moduleFiltered, ignoreDataNodes);
  }, [graphData, selectedModules, availableModules, ignoreDataNodes]);

  // Convert filtered graph data to DOT string for rendering
  const filteredDotString = useMemo(() => {
    // If no module filtering and data nodes are not ignored, use original DOT
    if (
      availableModules.length === 0 ||
      (selectedModules.size === availableModules.length && !ignoreDataNodes)
    ) {
      return dotString;
    }
    // Otherwise, generate filtered DOT (including when no modules are selected or data nodes ignored)
    return graphDataToDotString(filteredGraphData, dotString);
  }, [
    filteredGraphData,
    dotString,
    availableModules.length,
    selectedModules.size,
    ignoreDataNodes,
  ]);

  // Calculate all ancestors or successors when a node is selected
  const highlightData = useMemo(() => {
    if (!selectedNode || filteredGraphData.nodes.size === 0) {
      return { nodes: new Set<string>(), edges: new Set<string>() };
    }
    return showSuccessors
      ? findAllSuccessors(selectedNode, filteredGraphData)
      : findAllAncestors(selectedNode, filteredGraphData);
  }, [selectedNode, filteredGraphData, showSuccessors]);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(prev => (prev === nodeId ? null : nodeId));
  }, []);

  // Handle layout change
  const handleLayoutChange = useCallback((engine: LayoutEngine) => {
    graphRenderStartRef.current?.();
    setLayoutEngine(engine);
  }, []);

  // Handle search
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedNode(null); // Clear selection when searching
  }, []);

  // Load example graph
  const handleLoadExample = useCallback(() => {
    graphRenderStartRef.current?.();
    setDotString(EXAMPLE_GRAPH);
    setSelectedNode(null);
    setSearchQuery('');
  }, []);

  // Handle module selection change
  const handleModuleSelectionChange = useCallback((modules: Set<string>) => {
    graphRenderStartRef.current?.();
    setSelectedModules(modules);
    setSelectedNode(null); // Clear selection when changing modules
  }, []);

  const handleToggleIgnoreDataNodes = useCallback(() => {
    graphRenderStartRef.current?.();
    setIgnoreDataNodes(prev => !prev);
    setSelectedNode(null);
  }, []);

  const handleExport = useCallback((options: GraphExportOptions) => {
    graphExportRef.current?.(options);
  }, []);

  // Generate info message
  const highlightedNodeInfo = useMemo(() => {
    if (!selectedNode) return undefined;

    const roots = findRootNodes(filteredGraphData);
    const highlightCount = highlightData.nodes.size;

    if (roots.includes(selectedNode)) {
      return `"${selectedNode}" is a root node`;
    }

    if (highlightCount > 1) {
      const edgeCount = highlightData.edges.size / 2;
      const type = showSuccessors ? 'successor' : 'ancestor';
      return `"${selectedNode}" has ${highlightCount - 1} ${type}${highlightCount - 1 !== 1 ? 's' : ''} (${edgeCount} edge${edgeCount !== 1 ? 's' : ''})`;
    }

    return `"${selectedNode}" (isolated node)`;
  }, [selectedNode, filteredGraphData, highlightData, showSuccessors]);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="TerraDot Logo" className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold">
                TerraDot - Interactive Terraform / OpenTofu / Dot Graph Viewer
              </h1>
              <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">
                Visualize and explore your Terraform / OpenTofu dependency graphs with ease. Click
                on nodes to see their ancestors or successors, search for specific nodes, and filter
                by modules or data nodes. Perfect for understanding complex infrastructure paths.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleDarkMode}
            className="h-9 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 text-sm font-semibold text-white shadow-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60 transition-colors"
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ResizablePanels
          defaultLeftWidth={20}
          minLeftWidth={15}
          maxLeftWidth={40}
          leftPanel={
            <DotInputEditor
              value={dotString}
              onChange={value => {
                graphRenderStartRef.current?.();
                setDotString(value);
              }}
              onLoadExample={handleLoadExample}
            />
          }
          rightPanel={
            <div className="flex h-full flex-col gap-2">
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm transition-colors">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="min-w-[220px] flex-1">
                    <label htmlFor="search" className="sr-only">
                      Search nodes
                    </label>
                    <input
                      id="search"
                      type="text"
                      value={searchQuery}
                      onChange={e => handleSearchChange(e.target.value)}
                      placeholder="Search nodes..."
                      className="h-9 w-full px-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors shadow-sm"
                    />
                  </div>
                  <GraphControls
                    layoutEngine={layoutEngine}
                    onLayoutChange={handleLayoutChange}
                    showSuccessors={showSuccessors}
                    onToggleSuccessors={handleToggleSuccessors}
                    ignoreDataNodes={ignoreDataNodes}
                    onToggleIgnoreDataNodes={handleToggleIgnoreDataNodes}
                    availableModules={availableModules}
                    selectedModules={selectedModules}
                    onModuleSelectionChange={handleModuleSelectionChange}
                    onExport={handleExport}
                    exportDisabled={!graphReady}
                  />
                </div>
              </div>
              <div className="flex-1">
                <GraphViewer
                  dotString={filteredDotString}
                  onRenderStartReady={start => {
                    graphRenderStartRef.current = start;
                  }}
                  onRenderStatusChange={setGraphReady}
                  onExportReady={exporter => {
                    graphExportRef.current = exporter;
                  }}
                  onNodeClick={handleNodeClick}
                  highlightedNodes={highlightData.nodes}
                  highlightedEdges={highlightData.edges}
                  layoutEngine={layoutEngine}
                  searchQuery={searchQuery}
                />
              </div>
            </div>
          }
        />
      </main>

      {/* Footer */}
      {highlightedNodeInfo && (
        <div className="fixed bottom-16 right-6 z-20">
          <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md text-sm text-blue-800 dark:text-blue-200 transition-colors shadow-sm">
            {highlightedNodeInfo}
          </div>
        </div>
      )}

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 text-sm text-gray-600 dark:text-gray-400 transition-colors">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <a
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              href="https://github.com/kaiehrhardt/terradot#readme"
              target="_blank"
              rel="noreferrer"
            >
              Docs
            </a>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <a
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              href="https://github.com/kaiehrhardt/terradot"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <a
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              href="https://github.com/kaiehrhardt/terradot/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
            >
              License
            </a>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-gray-500 dark:text-gray-400">{__APP_VERSION__}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
