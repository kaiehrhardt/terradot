import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { graphviz } from 'd3-graphviz';
import { select } from 'd3-selection';
import type { GraphViewerProps } from '../types/graph.types';

export default function GraphViewer({
  dotString,
  onRenderStartReady,
  onNodeClick,
  highlightedNodes = new Set(),
  highlightedEdges = new Set(),
  layoutEngine = 'dot',
  searchQuery = '',
}: GraphViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [graphRendered, setGraphRendered] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const renderStartRef = useRef<number>(0);
  const renderTimeoutRef = useRef<number | null>(null);
  const renderFrameRef = useRef<number | null>(null);
  const renderDelayRef = useRef<number | null>(null);
  const MIN_OVERLAY_MS = 250;

  const notifyRenderStart = useCallback(() => {
    setError(null);
    setGraphRendered(false);
    setIsRendering(true);
    renderStartRef.current = window.performance.now();
    clearRenderTimeout();
  }, []);

  useEffect(() => {
    onRenderStartReady?.(notifyRenderStart);
  }, [notifyRenderStart, onRenderStartReady]);

  const clearRenderTimeout = () => {
    if (renderTimeoutRef.current !== null) {
      window.clearTimeout(renderTimeoutRef.current);
      renderTimeoutRef.current = null;
    }
  };

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

  useLayoutEffect(() => {
    if (!dotString.trim()) {
      setGraphRendered(false);
      setIsRendering(false);
      clearRenderTimeout();
      return;
    }

    notifyRenderStart();
  }, [dotString, layoutEngine, notifyRenderStart]);

  useEffect(() => {
    if (!containerRef.current || !dotString.trim()) {
      return;
    }

    const startRender = () => {
      try {
        // Modify DOT string for layout if needed
        let modifiedDot = dotString;
        const actualEngine =
          layoutEngine === 'dot-lr' || layoutEngine === 'dot-rl' ? 'dot' : layoutEngine;

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
          zoomScaleExtent: [0.1, 50],
        })
          .engine(actualEngine)
          .onerror(err => {
            console.error('Graphviz error:', err);
            setError(`Rendering error: ${err}`);
          });

        gv.renderDot(modifiedDot).on('end', () => {
          const elapsed = window.performance.now() - renderStartRef.current;
          const remaining = Math.max(0, MIN_OVERLAY_MS - elapsed);

          renderTimeoutRef.current = window.setTimeout(() => {
            setGraphRendered(true);
            setIsRendering(false);
            updateSvgBackground();
            setupInteractivity();
            // Apply highlighting after a short delay to ensure DOM is ready
            setTimeout(() => {
              applyHighlighting();
            }, 50);
          }, remaining);
        });
      } catch (err) {
        console.error('Error rendering graph:', err);
        setError(`Failed to render: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsRendering(false);
      }
    };

    renderFrameRef.current = window.requestAnimationFrame(() => {
      renderDelayRef.current = window.setTimeout(startRender, 0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      if (renderFrameRef.current !== null) {
        window.cancelAnimationFrame(renderFrameRef.current);
        renderFrameRef.current = null;
      }
      if (renderDelayRef.current !== null) {
        window.clearTimeout(renderDelayRef.current);
        renderDelayRef.current = null;
      }
      clearRenderTimeout();
    };
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

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          updateSvgBackground();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [graphRendered, updateSvgBackground]);

  return (
    <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-lg shadow-inner transition-colors">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded z-20">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {isRendering && dotString.trim() && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 rounded-lg">
          <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin mb-3" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Graph wird geladen…</span>
        </div>
      )}

      <div ref={containerRef} className="graph-container w-full h-full overflow-hidden" />
    </div>
  );
}
