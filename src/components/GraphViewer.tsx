import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { graphviz } from 'd3-graphviz';
import { select } from 'd3-selection';
import type { GraphExportOptions, GraphViewerProps } from '../types/graph.types';

export default function GraphViewer({
  dotString,
  onRenderStartReady,
  onRenderStatusChange,
  onExportReady,
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

  const notifyRenderStatus = useCallback(
    (ready: boolean) => {
      onRenderStatusChange?.(ready);
    },
    [onRenderStatusChange]
  );

  const getCurrentTransform = (svg: SVGSVGElement) => {
    const viewport = svg.querySelector('g');
    const transform = viewport?.getAttribute('transform');
    return transform ?? '';
  };

  const getRenderedSvg = useCallback(() => {
    if (!containerRef.current) return null;
    return containerRef.current.querySelector('svg');
  }, []);

  const cloneSvgForExport = (svg: SVGSVGElement, source: GraphExportOptions['source']) => {
    const cloned = svg.cloneNode(true) as SVGSVGElement;
    cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const isDark = document.documentElement.classList.contains('dark');
    const background = isDark ? '#111827' : 'white';
    cloned.style.backgroundColor = background;

    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = buildExportStyles(isDark);
    cloned.insertBefore(style, cloned.firstChild);

    const width = svg.clientWidth || 1200;
    const height = svg.clientHeight || 800;
    cloned.setAttribute('width', `${width}`);
    cloned.setAttribute('height', `${height}`);

    const originalViewBox = svg.getAttribute('viewBox');

    const viewport = cloned.querySelector('g');
    if (viewport) {
      if (source === 'raw') {
        const rawViewBox = computeRawViewBox(cloned, width, height, originalViewBox);
        cloned.setAttribute('viewBox', rawViewBox);
        viewport.removeAttribute('transform');
      } else {
        if (originalViewBox) {
          cloned.setAttribute('viewBox', originalViewBox);
        } else {
          cloned.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }
        const transform = getCurrentTransform(svg);
        if (transform) {
          viewport.setAttribute('transform', transform);
        }
      }
    }

    return cloned;
  };

  const computeRawViewBox = (
    svg: SVGSVGElement,
    width: number,
    height: number,
    fallbackViewBox: string | null
  ) => {
    const viewport = svg.querySelector('g');
    if (!viewport) {
      return fallbackViewBox ?? `0 0 ${width} ${height}`;
    }

    viewport.removeAttribute('transform');

    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-10000px';
    wrapper.style.top = '-10000px';
    wrapper.style.visibility = 'hidden';
    wrapper.style.pointerEvents = 'none';
    wrapper.appendChild(svg);
    document.body.appendChild(wrapper);

    let viewBox = fallbackViewBox ?? `0 0 ${width} ${height}`;
    try {
      const bbox = viewport.getBBox();
      const padding = 16;
      viewBox = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;
    } catch {
      viewBox = fallbackViewBox ?? `0 0 ${width} ${height}`;
    } finally {
      wrapper.remove();
    }

    return viewBox;
  };

  const buildExportStyles = (isDark: boolean) => {
    if (isDark) {
      return `
.node:not(.node-highlighted) ellipse,
.node:not(.node-highlighted) polygon,
.node:not(.node-highlighted) path { fill: #374151; stroke: #6b7280; }
.node:not(.node-highlighted) text { fill: #d1d5db; }
.edge:not(.edge-highlighted) path { stroke: #6b7280; }
.edge:not(.edge-highlighted) polygon { stroke: #6b7280; fill: #6b7280; }
.edge:not(.edge-highlighted) text { fill: #9ca3af; }
.node.node-highlighted ellipse,
.node.node-highlighted polygon,
.node.node-highlighted path { stroke: #60a5fa; stroke-width: 4; fill: #1e40af; }
.node.node-highlighted text { font-weight: bold; fill: #bfdbfe; }
.edge.edge-highlighted path { stroke: #fb923c; stroke-width: 4; }
.edge.edge-highlighted polygon { stroke: #fb923c; fill: #fb923c; }
.edge.edge-highlighted text { fill: #fdba74; font-weight: bold; }
.cluster polygon,
.cluster rect { fill: #1f2937; stroke: #4b5563; stroke-width: 1.5; }
.cluster text { fill: #e5e7eb; font-weight: 600; }
`.trim();
    }

    return `
.node.node-highlighted ellipse,
.node.node-highlighted polygon,
.node.node-highlighted path { stroke: #3b82f6; stroke-width: 3; fill: #dbeafe; }
.node.node-highlighted text { font-weight: bold; fill: #1e40af; }
.edge.edge-highlighted path { stroke: #ef4444; stroke-width: 3; }
.edge.edge-highlighted polygon { stroke: #ef4444; fill: #ef4444; }
.edge.edge-highlighted text { fill: #ef4444; font-weight: bold; }
`.trim();
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportSvg = (options: GraphExportOptions) => {
    const svg = getRenderedSvg();
    if (!svg) return;

    const cloned = cloneSvgForExport(svg, options.source);
    const serializer = new XMLSerializer();
    const svgText = serializer.serializeToString(cloned);
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const filename = `terradot-graph-${options.source}.svg`;
    downloadBlob(blob, filename);
  };

  const exportPng = (options: GraphExportOptions) => {
    const svg = getRenderedSvg();
    if (!svg) return;

    const cloned = cloneSvgForExport(svg, options.source);
    const serializer = new XMLSerializer();
    const svgText = serializer.serializeToString(cloned);
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const width = svg.clientWidth || 1200;
    const height = svg.clientHeight || 800;

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }

      const background = document.documentElement.classList.contains('dark') ? '#111827' : 'white';
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob(blob => {
        if (!blob) return;
        const filename = `terradot-graph-${options.source}.png`;
        downloadBlob(blob, filename);
      }, 'image/png');

      URL.revokeObjectURL(url);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
    };

    image.src = url;
  };

  const exportGraph = useCallback(
    (options: GraphExportOptions) => {
      if (options.format === 'svg') {
        exportSvg(options);
      } else {
        exportPng(options);
      }
    },
    [getRenderedSvg]
  );

  const notifyRenderStart = useCallback(() => {
    setError(null);
    setGraphRendered(false);
    setIsRendering(true);
    renderStartRef.current = window.performance.now();
    clearRenderTimeout();
    notifyRenderStatus(false);
  }, [notifyRenderStatus]);

  useEffect(() => {
    onRenderStartReady?.(notifyRenderStart);
  }, [notifyRenderStart, onRenderStartReady]);

  useEffect(() => {
    onExportReady?.(exportGraph);
  }, [exportGraph, onExportReady]);

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
      notifyRenderStatus(false);
      return;
    }

    notifyRenderStart();
  }, [dotString, layoutEngine, notifyRenderStart, notifyRenderStatus]);

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
            notifyRenderStatus(true);
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
        notifyRenderStatus(false);
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
