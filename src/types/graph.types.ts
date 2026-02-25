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

export interface GraphViewerProps {
  dotString: string;
  onNodeClick?: (nodeId: string) => void;
  highlightedNodes?: Set<string>;
  highlightedEdges?: Set<string>;
  layoutEngine?: LayoutEngine;
  searchQuery?: string;
}
