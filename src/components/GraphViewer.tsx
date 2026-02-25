import { useEffect, useRef, useState, useCallback } from 'react';
import { graphviz } from 'd3-graphviz';
import { select } from 'd3-selection';
import type { GraphViewerProps } from '../types/graph.types';

export default function GraphViewer({
  dotString,
  onNodeClick,
  highlightedNodes = new Set(),
  highlightedEdges = new Set(),
  layoutEngine = 'dot',
  searchQuery = '',
}: GraphViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [graphRendered, setGraphRendered] = useState(false);

  const setupInteractivity = useCallback(() => {
    if (!containerRef.current) return;

    const svg = select(containerRef.current).select('svg');
    const nodes = svg.selectAll('.node');

    nodes.on('click', function (event) {
      event.stopPropagation();
      
      // Extract node ID from the node element
      const nodeElement = select(this);
      const title = nodeElement.select('title').text();
      
      if (title && onNodeClick) {
        onNodeClick(title);
      }
    });

    // Add cursor pointer to nodes
    nodes.style('cursor', 'pointer');
  }, [onNodeClick]);

  // Apply highlighting (not wrapped in useCallback to avoid dependency issues)
  const applyHighlighting = () => {
    if (!containerRef.current) return;

    const svg = select(containerRef.current).select('svg');
    if (svg.empty()) {
      return;
    }
    
    // Reset all highlights
    svg.selectAll('.node').classed('node-highlighted', false);
    svg.selectAll('.edge').classed('edge-highlighted', false);

    // Highlight nodes
    if (highlightedNodes.size > 0) {
      svg.selectAll('.node').each(function () {
        const node = select(this);
        const title = node.select('title').text();
        
        if (highlightedNodes.has(title)) {
          node.classed('node-highlighted', true);
        }
      });

      // Highlight edges
      svg.selectAll('.edge').each(function () {
        const edge = select(this);
        const title = edge.select('title').text();
        
        if (highlightedEdges.has(title)) {
          edge.classed('edge-highlighted', true);
        }
      });
    }

    // Highlight search results
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      svg.selectAll('.node').each(function () {
        const node = select(this);
        const title = node.select('title').text().toLowerCase();
        
        if (title.includes(query)) {
          node.classed('node-highlighted', true);
        }
      });
    }
  };

  // Apply SVG background color based on dark mode
  const updateSvgBackground = useCallback(() => {
    if (!containerRef.current) return;
    
    const svg = select(containerRef.current).select('svg');
    if (svg.empty()) return;
    
    // Check if dark mode is active
    const isDark = document.documentElement.classList.contains('dark');
    
    // Set background on the SVG element itself
    svg.style('background-color', isDark ? '#111827' : 'white');
    
    // Also update the graph background polygon/rect if it exists
    svg.select('g > polygon').attr('fill', isDark ? '#111827' : 'white');
    svg.select('g > rect').attr('fill', isDark ? '#111827' : 'white');
  }, []);

  useEffect(() => {
    if (!containerRef.current || !dotString.trim()) return;

    setIsRendering(true);
    setError(null);
    setGraphRendered(false);

    try {
      // Modify DOT string for layout if needed
      let modifiedDot = dotString;
      const actualEngine = (layoutEngine === 'dot-lr' || layoutEngine === 'dot-rl') ? 'dot' : layoutEngine;
      
      // First, remove any existing rankdir statements (with or without quotes)
      modifiedDot = dotString.replace(/rankdir\s*=\s*"?(TB|LR|BT|RL)"?\s*;?/gi, '');
      
      if (layoutEngine === 'dot-lr') {
        // Insert rankdir=LR for Left-to-Right layout
        modifiedDot = modifiedDot.replace(
          /((?:di)?graph\s+(?:[^\s{]+\s*)?\{)/i,
          '$1\n  rankdir=LR;'
        );
      } else if (layoutEngine === 'dot-rl') {
        // Insert rankdir=RL for Right-to-Left layout
        modifiedDot = modifiedDot.replace(
          /((?:di)?graph\s+(?:[^\s{]+\s*)?\{)/i,
          '$1\n  rankdir=RL;'
        );
      } else {
        // For top-to-bottom, insert rankdir=TB
        modifiedDot = modifiedDot.replace(
          /((?:di)?graph\s+(?:[^\s{]+\s*)?\{)/i,
          '$1\n  rankdir=TB;'
        );
      }

      const gv = graphviz(containerRef.current, {
        useWorker: false,
        zoom: true,
      })
        .engine(actualEngine)
        .onerror((err) => {
          console.error('Graphviz error:', err);
          setError(`Rendering error: ${err}`);
          setIsRendering(false);
        });

      gv.renderDot(modifiedDot)
        .on('end', () => {
          setIsRendering(false);
          setGraphRendered(true);
          updateSvgBackground();
          setupInteractivity();
          // Apply highlighting after a short delay to ensure DOM is ready
          setTimeout(() => {
            applyHighlighting();
          }, 50);
        });
    } catch (err) {
      console.error('Error rendering graph:', err);
      setError(`Failed to render: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsRendering(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dotString, layoutEngine, setupInteractivity, updateSvgBackground]);

  // Handle highlighting when nodes/edges or search changes (only if graph is rendered)
  useEffect(() => {
    if (!graphRendered) return;
    applyHighlighting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedNodes, highlightedEdges, searchQuery, graphRendered]);

  // Update SVG background when dark mode changes
  useEffect(() => {
    if (!graphRendered) return;
    
    // Set initial background
    updateSvgBackground();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateSvgBackground();
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, [graphRendered, updateSvgBackground]);

  return (
    <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-lg shadow-inner transition-colors">
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/75 dark:bg-gray-800/90 backdrop-blur-sm z-10">
          <div className="text-gray-600 dark:text-gray-300">Rendering graph...</div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded z-20">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div
        ref={containerRef}
        className="graph-container w-full h-full overflow-hidden"
      />
    </div>
  );
}
