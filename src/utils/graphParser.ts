import type { GraphData, GraphEdge } from '../types/graph.types';

/**
 * Parse DOT string to extract graph structure
 * This is a simple parser that extracts node IDs and edges
 */
export function parseDotString(dotString: string): GraphData {
  const nodes = new Map();
  const edges: GraphEdge[] = [];
  const adjacencyList = new Map<string, string[]>();

  // Remove comments
  const cleanDot = dotString.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  // Extract edges (A -> B or "A" -> "B" or A -- B)
  // Match: quoted or unquoted node names
  const edgeRegex = /("(?:[^"\\]|\\.)+?"|\w+)\s*(-[->]|--)\s*("(?:[^"\\]|\\.)+?"|\w+)/g;
  let match;

  while ((match = edgeRegex.exec(cleanDot)) !== null) {
    // Remove quotes if present
    const from = match[1].replace(/^"|"$/g, '');
    const to = match[3].replace(/^"|"$/g, '');

    // Add nodes
    if (!nodes.has(from)) {
      nodes.set(from, { id: from });
    }
    if (!nodes.has(to)) {
      nodes.set(to, { id: to });
    }

    // Add edge
    edges.push({ from, to });

    // Build adjacency list (node -> parents)
    if (!adjacencyList.has(to)) {
      adjacencyList.set(to, []);
    }
    adjacencyList.get(to)!.push(from);
  }

  // Extract standalone nodes (nodes without edges)
  // Match: "quoted node" [attributes] or unquoted_node [attributes]
  // Must be at start of line (after optional whitespace) to avoid matching edge labels
  const nodeRegex = /^\s*("(?:[^"\\]|\\.)+?"|\w+)\s*\[[^\]]*\]/gm;
  while ((match = nodeRegex.exec(cleanDot)) !== null) {
    // Remove quotes if present
    const nodeId = match[1].replace(/^"|"$/g, '');
    if (!nodes.has(nodeId)) {
      nodes.set(nodeId, { id: nodeId });
    }
  }

  return { nodes, edges, adjacencyList };
}

/**
 * Find root nodes (nodes without incoming edges)
 */
export function findRootNodes(graphData: GraphData): string[] {
  const nodesWithIncoming = new Set<string>();

  graphData.edges.forEach(edge => {
    nodesWithIncoming.add(edge.to);
  });

  const roots: string[] = [];
  graphData.nodes.forEach((_, nodeId) => {
    if (!nodesWithIncoming.has(nodeId)) {
      roots.push(nodeId);
    }
  });

  return roots;
}

/**
 * Find path from a node to any root using BFS
 * If no root is found, returns path to the first ancestor (node with no more parents)
 */
export function findPathToRoot(nodeId: string, graphData: GraphData): string[] {
  const roots = findRootNodes(graphData);

  if (roots.includes(nodeId)) {
    return [nodeId];
  }

  // BFS to find shortest path to any root
  const queue: string[][] = [[nodeId]];
  const visited = new Set<string>();
  let longestPath: string[] = [nodeId];

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (visited.has(current)) continue;
    visited.add(current);

    // Update longest path found so far
    if (path.length > longestPath.length) {
      longestPath = path;
    }

    // If we found a root, return this path
    if (roots.includes(current)) {
      return path;
    }

    // Get all parent nodes (incoming edges)
    const parents = graphData.adjacencyList.get(current) || [];

    if (parents.length === 0 && path.length > 1) {
      // Current node has no more parents - this is as far as we can go
      // Return this path even if it's not a "true" root
      return path;
    }

    for (const parent of parents) {
      if (!visited.has(parent)) {
        queue.push([...path, parent]);
      }
    }
  }

  // No root found and all paths explored (likely a cycle)
  // Return the longest path we found
  return longestPath;
}

/**
 * Find all ancestors of a node (all nodes that have a path to this node)
 * Returns both the set of ancestor nodes and all edges in the ancestor tree
 */
export function findAllAncestors(
  nodeId: string,
  graphData: GraphData
): { nodes: Set<string>; edges: Set<string> } {
  const ancestorNodes = new Set<string>();
  const ancestorEdges = new Set<string>();
  const visited = new Set<string>();
  const queue: string[] = [nodeId];

  // Add the clicked node itself
  ancestorNodes.add(nodeId);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current)) continue;
    visited.add(current);

    // Get all parent nodes (nodes that point to current)
    const parents = graphData.adjacencyList.get(current) || [];

    for (const parent of parents) {
      // Add parent node to ancestors
      ancestorNodes.add(parent);

      // Add edge to ancestor edges (both directions for matching)
      ancestorEdges.add(`${parent}->${current}`);
      ancestorEdges.add(`${current}<-${parent}`);

      // Continue traversing up the tree
      if (!visited.has(parent)) {
        queue.push(parent);
      }
    }
  }

  return { nodes: ancestorNodes, edges: ancestorEdges };
}

/**
 * Find all successors of a node (all nodes that this node has a path to)
 * Returns both the set of successor nodes and all edges in the successor tree
 */
export function findAllSuccessors(
  nodeId: string,
  graphData: GraphData
): { nodes: Set<string>; edges: Set<string> } {
  const successorNodes = new Set<string>();
  const successorEdges = new Set<string>();
  const visited = new Set<string>();
  const queue: string[] = [nodeId];

  // Add the clicked node itself
  successorNodes.add(nodeId);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current)) continue;
    visited.add(current);

    // Get all child nodes (nodes that current points to)
    for (const edge of graphData.edges) {
      if (edge.from === current) {
        const child = edge.to;

        // Add child node to successors
        successorNodes.add(child);

        // Add edge to successor edges (both directions for matching)
        successorEdges.add(`${current}->${child}`);
        successorEdges.add(`${child}<-${current}`);

        // Continue traversing down the tree
        if (!visited.has(child)) {
          queue.push(child);
        }
      }
    }
  }

  return { nodes: successorNodes, edges: successorEdges };
}

/**
 * Get edges that form a path
 */
export function getPathEdges(path: string[]): Set<string> {
  const pathEdges = new Set<string>();

  for (let i = 0; i < path.length - 1; i++) {
    // Edge format: "from->to" or "to<-from" depending on direction
    pathEdges.add(`${path[i + 1]}->${path[i]}`);
    pathEdges.add(`${path[i]}<-${path[i + 1]}`);
  }

  return pathEdges;
}
