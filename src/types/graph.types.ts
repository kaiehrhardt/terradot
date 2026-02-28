export interface GraphNode {
  id: string;
  label?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface GraphData {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  adjacencyList: Map<string, string[]>; // node -> parents
}

export type LayoutEngine = 'dot' | 'dot-lr' | 'dot-rl';

export type GraphExportFormat = 'svg' | 'png';
export type GraphExportSource = 'current' | 'raw';

export interface GraphExportOptions {
  format: GraphExportFormat;
  source: GraphExportSource;
}

export interface GraphViewerProps {
  dotString: string;
  onRenderStartReady?: (start: () => void) => void;
  onRenderStatusChange?: (ready: boolean) => void;
  onExportReady?: (exporter: (options: GraphExportOptions) => void) => void;
  onNodeClick?: (_nodeId: string) => void;
  highlightedNodes?: Set<string>;
  highlightedEdges?: Set<string>;
  layoutEngine?: LayoutEngine;
  searchQuery?: string;
}
