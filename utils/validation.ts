import { Node, Edge } from "reactflow";

export function validateWorkflow(nodes: Node[], edges: Edge[]) {
  const errors: string[] = [];

  // ❌ 1. No nodes
  if (nodes.length === 0) {
    errors.push("Workflow is empty");
    return { errors };
  }

  // ❌ 2. Start Node Check
  const startNodes = nodes.filter((n) => n.type === "start");

  if (startNodes.length === 0) {
    errors.push("No Start Node found");
  }

  if (startNodes.length > 1) {
    errors.push("Multiple Start Nodes found");
  }

  // ❌ 3. End Node Check
  const endNodes = nodes.filter((n) => n.type === "end");

  if (endNodes.length === 0) {
    errors.push("No End Node found");
  }

  // ❌ 4. Disconnected Nodes
  const connectedNodeIds = new Set<string>();

  edges.forEach((e) => {
    connectedNodeIds.add(e.source);
    connectedNodeIds.add(e.target);
  });

  nodes.forEach((node) => {
    if (!connectedNodeIds.has(node.id)) {
      errors.push(`Node "${node.data.label}" is disconnected`);
    }
  });

  // ❌ 5. Cycle Detection (DFS)
  const graph: Record<string, string[]> = {};

  nodes.forEach((n) => {
    graph[n.id] = [];
  });

  edges.forEach((e) => {
    graph[e.source].push(e.target);
  });

  const visited = new Set<string>();
  const recStack = new Set<string>();

  const hasCycle = (nodeId: string): boolean => {
    if (!visited.has(nodeId)) {
      visited.add(nodeId);
      recStack.add(nodeId);

      for (const neighbor of graph[nodeId]) {
        if (!visited.has(neighbor) && hasCycle(neighbor)) {
          return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }
    }

    recStack.delete(nodeId);
    return false;
  };

  for (const node of nodes) {
    if (hasCycle(node.id)) {
      errors.push("Cycle detected in workflow");
      break;
    }
  }

  return { errors };
}
