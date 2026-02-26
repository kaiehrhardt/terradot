import type { GraphData, GraphEdge, GraphNode } from '../types/graph.types';

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
  // Exclude global attribute declarations (node, edge, graph)
  const nodeRegex = /^\s*("(?:[^"\\]|\\.)+?"|\w+)\s*\[[^\]]*\]/gm;
  while ((match = nodeRegex.exec(cleanDot)) !== null) {
    // Remove quotes if present
    const nodeId = match[1].replace(/^"|"$/g, '');

    // Skip global attribute declarations
    if (nodeId === 'node' || nodeId === 'edge' || nodeId === 'graph' || nodeId === 'subgraph') {
      continue;
    }

    if (!nodes.has(nodeId)) {
      nodes.set(nodeId, { id: nodeId });
    }
  }

  return { nodes, edges, adjacencyList };
}

/**
 * Extract all unique modules from the graph nodes
 * Supports both top-level and nested modules
 * Examples:
 *   - "module.vpc" -> ["vpc"]
 *   - "module.eks_managed_node_group.module.user_data" -> ["eks_managed_node_group", "eks_managed_node_group.module.user_data"]
 */
export function extractModules(graphData: GraphData): string[] {
  const modules = new Set<string>();

  graphData.nodes.forEach((_, nodeId) => {
    // Match all module patterns in the node ID
    // Handles: module.name, module.name.module.nested, etc.
    const moduleMatches = nodeId.matchAll(/module\.([a-zA-Z0-9_]+(?:\.module\.[a-zA-Z0-9_]+)*)/g);

    for (const match of moduleMatches) {
      const fullModulePath = match[1];

      // Add all module path prefixes for any nesting depth
      // Example: a.module.b.module.c -> ["a", "a.module.b", "a.module.b.module.c"]
      const parts = fullModulePath.split('.module.');
      let prefix = '';
      for (let i = 0; i < parts.length; i++) {
        prefix = prefix ? `${prefix}.module.${parts[i]}` : parts[i];
        modules.add(prefix);
      }
    }
  });

  return Array.from(modules).sort();
}

/**
 * Check if a node belongs to a specific module
 * Supports matching both exact module names and parent modules
 */
function extractNodeModulePath(nodeId: string): string | null {
  const parts: string[] = [];
  let remaining = nodeId;

  while (remaining.startsWith('module.')) {
    const withoutPrefix = remaining.slice('module.'.length);
    const nextDelimiter = withoutPrefix.indexOf('.');
    if (nextDelimiter === -1) return null;

    const moduleName = withoutPrefix.slice(0, nextDelimiter);
    parts.push(moduleName);
    remaining = withoutPrefix.slice(nextDelimiter + 1);

    if (!remaining.startsWith('module.')) {
      break;
    }
  }

  if (parts.length === 0) return null;
  return parts.join('.module.');
}

export function nodeMatchesModule(nodeId: string, moduleName: string): boolean {
  const path = extractNodeModulePath(nodeId);
  if (!path) return false;
  return path === moduleName;
}

/**
 * Filter graph data to only include nodes and edges for selected modules
 * If no modules are selected or all are selected, returns the original graph
 */
export function filterGraphByModules(
  graphData: GraphData,
  selectedModules: Set<string>,
  allModules: string[]
): GraphData {
  // If no modules exist or all modules are selected, return original graph
  if (allModules.length === 0 || selectedModules.size === allModules.length) {
    return graphData;
  }

  // If no modules are selected, only show root nodes (nodes without modules)
  // This is handled by the filtering logic below

  // Filter nodes
  const filteredNodes = new Map<string, GraphNode>();
  graphData.nodes.forEach((node, nodeId) => {
    // Check if node belongs to any selected module
    const belongsToSelectedModule = Array.from(selectedModules).some(moduleName =>
      nodeMatchesModule(nodeId, moduleName)
    );

    // Also include nodes that don't belong to any module (e.g., root nodes)
    const hasNoModule = !allModules.some(moduleName => nodeMatchesModule(nodeId, moduleName));

    if (belongsToSelectedModule || hasNoModule) {
      filteredNodes.set(nodeId, node);
    }
  });

  // Filter edges - only keep edges where both nodes are in the filtered set
  const filteredEdges = graphData.edges.filter(
    edge => filteredNodes.has(edge.from) && filteredNodes.has(edge.to)
  );

  // Rebuild adjacency list
  const filteredAdjacencyList = new Map<string, string[]>();
  filteredEdges.forEach(edge => {
    if (!filteredAdjacencyList.has(edge.to)) {
      filteredAdjacencyList.set(edge.to, []);
    }
    filteredAdjacencyList.get(edge.to)!.push(edge.from);
  });

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    adjacencyList: filteredAdjacencyList,
  };
}

/**
 * Convert GraphData back to a DOT string
 * Preserves subgraph structures from the original DOT
 */
export function graphDataToDotString(graphData: GraphData, originalDot: string): string {
  // If no nodes, return empty graph
  if (graphData.nodes.size === 0) {
    return 'digraph Empty { }';
  }

  // Extract graph name from original DOT
  const nameMatch = originalDot.match(/(?:di)?graph\s+([^\s{]+)/i);
  const graphName = nameMatch ? nameMatch[1] : 'G';

  // Start building the new DOT string
  const lines: string[] = [];
  lines.push(`digraph ${graphName} {`);

  // Extract and preserve global settings (rankdir, node, edge declarations)
  const globalSettings: string[] = [];

  // Extract rankdir
  const rankdirMatch = originalDot.match(/rankdir\s*=\s*"?(TB|LR|BT|RL)"?\s*;?/i);
  if (rankdirMatch) {
    globalSettings.push(`  rankdir = "${rankdirMatch[1]}";`);
  }

  // Extract node default attributes
  const nodeAttrMatch = originalDot.match(/node\s*\[[^\]]+\];?/i);
  if (nodeAttrMatch) {
    globalSettings.push(`  ${nodeAttrMatch[0]}`);
  }

  // Extract edge default attributes
  const edgeAttrMatch = originalDot.match(/edge\s*\[[^\]]+\];/i);
  if (edgeAttrMatch) {
    globalSettings.push(`  ${edgeAttrMatch[0]}`);
  }

  if (globalSettings.length > 0) {
    lines.push(...globalSettings);
  }

  // Parse subgraphs from original DOT
  const subgraphRegex = /subgraph\s+"([^"]+)"\s*\{\s*label\s*=\s*"([^"]+)"/g;
  const allSubgraphs = new Map<string, { clusterId: string; label: string }>();

  let subgraphMatch;
  while ((subgraphMatch = subgraphRegex.exec(originalDot)) !== null) {
    const clusterId = subgraphMatch[1];
    const label = subgraphMatch[2];
    allSubgraphs.set(label, { clusterId, label });
  }

  // Sort subgraph labels by length (longest first) to match nested modules first
  const sortedSubgraphLabels = Array.from(allSubgraphs.entries()).sort(
    (a, b) => b[0].length - a[0].length
  );

  // Group nodes by their module/subgraph
  const nodesBySubgraph = new Map<string, string[]>();
  const rootNodes: string[] = [];

  graphData.nodes.forEach((_, nodeId) => {
    // Check if this node belongs to a subgraph
    let foundSubgraph = false;

    for (const [label, _info] of sortedSubgraphLabels) {
      // Extract module name from label (e.g., "module.eks_managed_node_group")
      if (nodeId.startsWith(label + '.')) {
        if (!nodesBySubgraph.has(label)) {
          nodesBySubgraph.set(label, []);
        }
        nodesBySubgraph.get(label)!.push(nodeId);
        foundSubgraph = true;
        break;
      }
    }

    if (!foundSubgraph) {
      rootNodes.push(nodeId);
    }
  });

  // Add root-level node declarations
  if (rootNodes.length > 0) {
    lines.push('');
    rootNodes.forEach(nodeId => {
      // Extract label from original if it exists
      const labelMatch = originalDot.match(
        new RegExp(`"${nodeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*\\[label="([^"]+)"\\]`)
      );
      const label = labelMatch ? labelMatch[1] : nodeId;
      lines.push(`  "${nodeId}" [label="${label}"];`);
    });
  }

  // Add subgraphs with their nodes (only subgraphs that have nodes)
  nodesBySubgraph.forEach((nodes, label) => {
    const info = allSubgraphs.get(label);
    if (!info || nodes.length === 0) return;

    lines.push('');
    lines.push(`  subgraph "${info.clusterId}" {`);
    lines.push(`    label = "${info.label}"`);
    lines.push(`    fontname = "sans-serif"`);

    nodes.forEach(nodeId => {
      // Extract label from original if it exists
      const labelMatch = originalDot.match(
        new RegExp(`"${nodeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*\\[label="([^"]+)"\\]`)
      );
      const label = labelMatch ? labelMatch[1] : nodeId.split('.').pop() || nodeId;
      lines.push(`    "${nodeId}" [label="${label}"];`);
    });

    lines.push('  }');
  });

  // Add edges
  if (graphData.edges.length > 0) {
    lines.push('');
    graphData.edges.forEach(edge => {
      lines.push(`  "${edge.from}" -> "${edge.to}";`);
    });
  }

  lines.push('}');
  return lines.join('\n');
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
