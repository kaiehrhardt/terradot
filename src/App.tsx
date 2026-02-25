import { useCallback, useEffect, useMemo, useState } from 'react';
import GraphViewer from './components/GraphViewer';
import DotInputEditor from './components/DotInputEditor';
import GraphControls from './components/GraphControls';
import ResizablePanels from './components/ResizablePanels';
import {
  findAllAncestors,
  findAllSuccessors,
  findRootNodes,
  parseDotString,
} from './utils/graphParser';
import { EXAMPLE_GRAPH } from './utils/examples';
import type { LayoutEngine } from './types/graph.types';

function App() {
  const [dotString, setDotString] = useState(EXAMPLE_GRAPH);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [layoutEngine, setLayoutEngine] = useState<LayoutEngine>('dot');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessors, setShowSuccessors] = useState(false);

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

  // Calculate all ancestors or successors when a node is selected
  const highlightData = useMemo(() => {
    if (!selectedNode || graphData.nodes.size === 0) {
      return { nodes: new Set<string>(), edges: new Set<string>() };
    }
    return showSuccessors
      ? findAllSuccessors(selectedNode, graphData)
      : findAllAncestors(selectedNode, graphData);
  }, [selectedNode, graphData, showSuccessors]);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
  }, []);

  // Handle layout change
  const handleLayoutChange = useCallback((engine: LayoutEngine) => {
    setLayoutEngine(engine);
  }, []);

  // Handle search
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedNode(null); // Clear selection when searching
  }, []);

  // Load example graph
  const handleLoadExample = useCallback(() => {
    setDotString(EXAMPLE_GRAPH);
    setSelectedNode(null);
    setSearchQuery('');
  }, []);

  // Generate info message
  const highlightedNodeInfo = useMemo(() => {
    if (!selectedNode) return undefined;

    const roots = findRootNodes(graphData);
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
  }, [selectedNode, graphData, highlightData, showSuccessors]);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white px-6 py-4 shadow-lg">
        <h1 className="text-2xl font-bold">TerraDot - Interactive DOT Graph Viewer</h1>
        <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">
          Visualize and explore Graphviz DOT graphs • Click nodes to highlight all ancestor paths
        </p>
      </header>

      {/* Controls */}
      <GraphControls
        layoutEngine={layoutEngine}
        onLayoutChange={handleLayoutChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        highlightedNodeInfo={highlightedNodeInfo}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        showSuccessors={showSuccessors}
        onToggleSuccessors={handleToggleSuccessors}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ResizablePanels
          defaultLeftWidth={20}
          minLeftWidth={15}
          maxLeftWidth={40}
          leftPanel={
            <DotInputEditor
              value={dotString}
              onChange={setDotString}
              onLoadExample={handleLoadExample}
            />
          }
          rightPanel={
            <GraphViewer
              dotString={dotString}
              onNodeClick={handleNodeClick}
              highlightedNodes={highlightData.nodes}
              highlightedEdges={highlightData.edges}
              layoutEngine={layoutEngine}
              searchQuery={searchQuery}
            />
          }
        />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors">
        Built with React, TypeScript, D3-Graphviz, and Tailwind CSS • Powered by Bun
      </footer>
    </div>
  );
}

export default App;
