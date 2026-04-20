import { create } from "zustand";
import { Node, Edge } from "reactflow";

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  past: Array<{ nodes: Node[]; edges: Edge[] }>;
  future: Array<{ nodes: Node[]; edges: Edge[] }>;

  // Simulation
  simulationSteps: string[][];
  currentStep: number;
  isSimulating: boolean;
  isLoading: boolean;
  decision: "approve" | "reject";

  // Validation
  validationErrors: string[];

  saveHistory: () => void;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setSelectedNode: (node: Node | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  updateEdgeData: (edgeId: string, updates: Partial<Edge> | Record<string, any>) => void;
  removeEdge: (edgeId: string) => void;
  setSimulation: (steps: string[][]) => void;
  setLoading: (loading: boolean) => void;
  setDecision: (decision: "approve" | "reject") => void;
  nextStep: () => void;
  stopSimulation: () => void;
  undo: () => void;
  redo: () => void;
  validateWorkflow: () => boolean;
  runSimulation: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  past: [],
  future: [],

  // Simulation
  simulationSteps: [],
  currentStep: 0,
  isSimulating: false,
  isLoading: false,
  decision: "approve",

  // Validation
  validationErrors: [],

  // 🔥 SAVE STATE BEFORE CHANGE
  saveHistory: () => {
    const { nodes, edges, past } = get();
    set({
      past: [...past, { nodes, edges }],
      future: [],
    });
  },

  setNodes: (nodes) => {
    set({
      nodes: typeof nodes === "function" ? nodes(get().nodes) : nodes,
    });
  },

  setEdges: (edges) => {
    set({
      edges: typeof edges === "function" ? edges(get().edges) : edges,
    });
  },

  setSelectedNode: (node) => set({ selectedNode: node, selectedEdge: null }),

  setSelectedEdge: (edge) => set({ selectedEdge: edge, selectedNode: null }),

  updateNodeData: (nodeId, data) => {
    const { nodes, selectedNode } = get();
    get().saveHistory();
    const updatedNodes = nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    );
    set({
      nodes: updatedNodes,
      selectedNode: selectedNode?.id === nodeId
        ? { ...selectedNode, data: { ...selectedNode.data, ...data } }
        : selectedNode,
    });
  },

  updateEdgeData: (edgeId, updates) => {
    const { edges, selectedEdge } = get();
    get().saveHistory();
    const updatedEdges = edges.map((edge) =>
      edge.id === edgeId
        ? {
            ...edge,
            ...updates,
            data: { ...edge.data, ...(updates.data || {}) },
            style: { ...edge.style, ...(updates.style || {}) },
          }
        : edge
    );
    set({
      edges: updatedEdges,
      selectedEdge: selectedEdge?.id === edgeId
        ? {
            ...selectedEdge,
            ...updates,
            data: { ...selectedEdge.data, ...(updates.data || {}) },
            style: { ...selectedEdge.style, ...(updates.style || {}) },
          }
        : selectedEdge,
    });
  },

  removeEdge: (edgeId) => {
    const { edges } = get();
    get().saveHistory();
    set({
      edges: edges.filter((e) => e.id !== edgeId),
      selectedEdge: null,
    });
  },

  // 🎬 SIMULATION
  setSimulation: (steps: string[][]) =>
    set({
      simulationSteps: steps,
      currentStep: 0,
      isSimulating: true,
    }),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setDecision: (decision: "approve" | "reject") =>
    set({ decision }),

  nextStep: () =>
    set((state) => ({
      currentStep: state.currentStep + 1,
    })),

  stopSimulation: () =>
    set({
      isSimulating: false,
      simulationSteps: [],
      currentStep: 0,
    }),

  // 🔁 UNDO
  undo: () => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];

    set({
      nodes: previous.nodes,
      edges: previous.edges,
      past: past.slice(0, -1),
      future: [{ nodes, edges }, ...future],
    });
  },

  // 🔁 REDO
  redo: () => {
    const { future, nodes, edges, past } = get();
    if (future.length === 0) return;

    const next = future[0];

    set({
      nodes: next.nodes,
      edges: next.edges,
      future: future.slice(1),
      past: [...past, { nodes, edges }],
    });
  },

  // ✅ VALIDATION
  validateWorkflow: () => {
    const { nodes, edges } = get();

    const errors: string[] = [];

    if (nodes.length === 0) {
      errors.push("No nodes in workflow");
    }

    // ✅ 1. Missing Start Node
    const startNodes = nodes.filter(
      (n) => !edges.some((e) => e.target === n.id)
    );

    if (startNodes.length === 0) {
      errors.push("No Start Node found");
    }

    // ⚠️ Multiple start nodes (optional rule)
    if (startNodes.length > 1) {
      errors.push("Multiple Start Nodes found");
    }

    // ✅ 1.5 Start nodes must have NO incoming edges
    nodes.forEach((node) => {
      const nodeLabel = (node.data as Record<string, unknown>)?.label || node.id;
      const isStartNode = (nodeLabel as string).toLowerCase() === "start" || (node.data as Record<string, unknown>)?.type === "start";
      
      if (isStartNode) {
        const incomingEdges = edges.filter((e) => e.target === node.id);
        if (incomingEdges.length > 0) {
          errors.push(`Start node "${nodeLabel}" must have NO incoming edges`);
        }
      }
    });

    // ✅ 2. Detect Cycles (DFS)
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cyclePath: string[] = [];

    const hasCycle = (nodeId: string, currentPath: string[]): boolean => {
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        recStack.add(nodeId);
        currentPath.push(nodeId);

        const neighbors = edges
          .filter((e) => e.source === nodeId)
          .map((e) => e.target);

        for (const neighbor of neighbors) {
          if (
            !visited.has(neighbor) && hasCycle(neighbor, currentPath)
          ) {
            return true;
          } else if (recStack.has(neighbor)) {
            const startIndex = currentPath.indexOf(neighbor);
            const path = currentPath.slice(startIndex !== -1 ? startIndex : 0);
            path.push(neighbor); // Show closing the loop
            cyclePath.push(...path);
            return true;
          }
        }
      }

      recStack.delete(nodeId);
      currentPath.pop();
      return false;
    };

    for (const node of nodes) {
      if (hasCycle(node.id, [])) {
        const labels = cyclePath.map(id => {
          const n = nodes.find(x => x.id === id);
          return n ? ((n.data as Record<string, unknown>)?.label || n.id) : id;
        });
        errors.push(`Cycle detected involving: ${labels.join(" -> ")}`);
        break;
      }
    }

    // ✅ 3. Disconnected Nodes (BFS from start)
    if (startNodes.length > 0) {
      const reachable = new Set<string>();
      const queue = [...startNodes.map((n) => n.id)];

      while (queue.length > 0) {
        const current = queue.shift()!;
        reachable.add(current);

        const children = edges
          .filter((e) => e.source === current)
          .map((e) => e.target);

        children.forEach((child) => {
          if (!reachable.has(child)) queue.push(child);
        });
      }

      const disconnected = nodes.filter(
        (n) => !reachable.has(n.id)
      );

      if (disconnected.length > 0) {
        errors.push(
          `Disconnected nodes: ${
            disconnected
              .map((n) => (n.data as Record<string, unknown>)?.label || n.id)
              .join(", ")
          }`
        );
      }
    }

    set({ validationErrors: errors });

    return errors.length === 0;
  },

  // 🎬 RUN SIMULATION
  runSimulation: () => {
    const isValid = get().validateWorkflow();

    if (!isValid) {
      console.warn("❌ Workflow validation failed");
      return;
    }

    const { nodes, edges } = get();

    const visited = new Set<string>();
    const steps: string[][] = [];

    let currentLevel = nodes
      .filter((n) => !edges.some((e) => e.target === n.id))
      .map((n) => n.id);

    while (currentLevel.length > 0) {
      steps.push(currentLevel);

      currentLevel.forEach((id) => visited.add(id));

      const nextLevel: string[] = [];

      nodes.forEach((node) => {
        if (visited.has(node.id)) return;

        const incoming = edges.filter((e) => e.target === node.id);
        if (incoming.length === 0) return;

        // ✅ If parent is approval → only follow APPROVE branch
        const filteredIncoming = incoming.filter((e) => {
          const parent = nodes.find((n) => n.id === e.source);

          if (parent?.data?.label?.toLowerCase() === "approval") {
            return e.data?.branch === "approve"; // simulate approve path
          }

          return true;
        });

        const ready = filteredIncoming.every((e) =>
          visited.has(e.source)
        );

        if (ready) nextLevel.push(node.id);
      });

      if (nextLevel.length === 0) break;

      currentLevel = nextLevel;
    }

    set({
      simulationSteps: steps,
      currentStep: 0,
      isSimulating: true,
    });
  },
}));
