"use client";

import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";

import React, { useCallback, useEffect } from "react";
import { useWorkflowStore } from "@/store/workflowStore";
import CustomNode from "./CustomNode";
import CustomEdge from "./edges";

// ✅ MUST be outside component (stable reference)
const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const defaultEdgeOptions = { type: "custom" };

export default function WorkflowCanvas() {
  const { nodes, edges, setNodes, setEdges, setSelectedNode, setSelectedEdge, isSimulating, saveHistory } = useWorkflowStore();

  // 🎬 SIMULATION LOOP
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const state = useWorkflowStore.getState();
      
      if (state.currentStep >= state.simulationSteps.length - 1) {
        state.stopSimulation();
        clearInterval(interval);
      } else {
        state.nextStep();
      }
    }, 1500); // 1.5 seconds per step

    return () => clearInterval(interval);
  }, [isSimulating]);

  // 🗑️ DELETE EDGE FUNCTION
  const deleteEdge = useCallback(
    (id: string) => {
      saveHistory(); // ✅ Save history before edge deletion
      setEdges((eds: Edge[]) => eds.filter((e) => e.id !== id));
      setSelectedEdge(null);
    },
    [setEdges, setSelectedEdge, saveHistory]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      console.log("🔌 CONNECTION ATTEMPT:");
      console.log(`  Source Node: ${sourceNode?.data?.label} (${params.source})`);
      console.log(`  Source Handle: ${params.sourceHandle}`);
      console.log(`  Target Node: ${targetNode?.data?.label} (${params.target})`);
      console.log(`  Target Handle: ${params.targetHandle}`);

      // ❌ Prevent self-loop
      if (params.source === params.target) {
        alert("❌ Cannot connect node to itself");
        return;
      }

      // ✅ LOGIC FIX: Check if START is trying to be TARGET (incoming to start)
      // Start node should NEVER receive incoming edges
      const startNodeId = nodes.find((n) => n.data.label?.toLowerCase() === "start")?.id;
      
      if (params.target === startNodeId) {
        console.warn("⚠️ Attempting to connect TO start node - blocking");
        alert("❌ Cannot connect into Start node");
        return;
      }

      console.log("✅ Connection allowed - Creating edge");
      saveHistory(); // ✅ Save history before connection
      setEdges((eds: Edge[]) =>
        addEdge(
          {
            ...params,
            type: "custom",
            style: {
              stroke:
                params.sourceHandle === "approve"
                  ? "#22c55e" // green
                  : params.sourceHandle === "reject"
                  ? "#ef4444" // red
                  : "#999",
            },
            data: {
              onDelete: deleteEdge,
              branch: params.sourceHandle, // ✅ Store branch info for approval nodes
            },
          },
          eds
        )
      );
    },
    [nodes, setEdges, deleteEdge, saveHistory]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      // ✅ Get the node type from drag event
      const type = event.dataTransfer.getData("application/reactflow");

      if (!type) {
        console.warn("⚠️ No node type in drag data");
        return;
      }

      const validTypes = ["start", "task", "approval", "automation", "end"];
      if (!validTypes.includes(type)) {
        console.warn(`⚠️ Invalid node type: ${type}`);
        return;
      }

      // ✅ Get canvas bounds (relative to the canvas container)
      const bounds = event.currentTarget.getBoundingClientRect();

      const newNode: Node = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "custom", // All nodes use custom type
        position: {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        },
        data: { label: type }, // Store the actual node type in label
      };

      console.log(`✅ Creating node: ${type} at (${newNode.position.x}, ${newNode.position.y})`);
      saveHistory(); // ✅ Save history before adding node
      setNodes((nds: Node[]) => [...nds, newNode]);
    },
    [setNodes, saveHistory]
  );

  const onNodeClick = (_: unknown, node: Node) => {
    setSelectedNode(node);
  };

  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
  };

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      if (changes.some((c) => c.type === "remove")) saveHistory();
      setNodes((nds: Node[]) => applyNodeChanges(changes, nds));
    },
    [setNodes, saveHistory]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (changes.some((c) => c.type === "remove")) saveHistory();
      setEdges((eds: Edge[]) => applyEdgeChanges(changes, eds));
    },
    [setEdges, saveHistory]
  );

  const onNodeDragStart = useCallback(() => {
    saveHistory(); // ✅ Save history right before a node begins moving
  }, [saveHistory]);

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodeDragStart={onNodeDragStart}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        fitView
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
      >
        {/* Arrow marker */}
        <svg>
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="10"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#4B5563" />
            </marker>
          </defs>
        </svg>

        <Background />
        <Controls />
        <MiniMap />

        {/* Empty State */}
        {nodes.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <div className="bg-white px-6 py-4 rounded-lg shadow text-gray-500 text-sm">
              Drag nodes from the left to start building workflow
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
}