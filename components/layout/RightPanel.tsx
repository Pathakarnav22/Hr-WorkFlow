"use client";

import { useWorkflowStore } from "@/store/workflowStore";
import TaskForm from "@/components/forms/TaskForm";
import ApprovalForm from "@/components/forms/ApprovalForm";
import AutomationForm from "@/components/forms/AutomationForm";
import EndForm from "@/components/forms/EndForm";
import StartForm from "@/components/forms/StartForm";
import { Trash2 } from "lucide-react";

export default function RightPanel() {
  const { selectedNode, selectedEdge, updateNodeData, updateEdgeData, removeEdge } = useWorkflowStore();

  // Show empty state if nothing selected
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="w-80 border-l bg-white shadow-sm p-4 flex items-center justify-center text-gray-400 overflow-y-auto">
        Select a node or connection to edit
      </div>
    );
  }

  const handleChange = (key: string, value: string) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { [key]: value });
    }
  };

  // 🔗 EDGE SELECTED
  if (selectedEdge) {
    const handleEdgeChange = (key: string, value: string) => {
      if (key === "label") {
        updateEdgeData(selectedEdge.id, { label: value });
      } else {
        updateEdgeData(selectedEdge.id, { data: { ...selectedEdge.data, [key]: value } });
      }
    };

    const setEdgeColor = (color: string) => {
      updateEdgeData(selectedEdge.id, {
        style: { ...selectedEdge.style, stroke: color, strokeWidth: 2 }
      });
    };

    return (
      <div className="w-80 border-l p-4 bg-white shadow-sm overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Connection Settings</h2>
          <button 
            onClick={() => removeEdge(selectedEdge.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
            title="Delete Connection"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* IMPORTANCE / COLOR */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Importance (Color)</label>
          <div className="flex gap-2 mt-2">
             <button onClick={() => setEdgeColor('#9ca3af')} className="w-6 h-6 rounded-full bg-gray-400 hover:ring-2 ring-offset-1 ring-gray-400" title="Normal" />
             <button onClick={() => setEdgeColor('#3b82f6')} className="w-6 h-6 rounded-full bg-blue-500 hover:ring-2 ring-offset-1 ring-blue-500" title="Important (Blue)" />
             <button onClick={() => setEdgeColor('#eab308')} className="w-6 h-6 rounded-full bg-yellow-500 hover:ring-2 ring-offset-1 ring-yellow-500" title="Warning (Yellow)" />
             <button onClick={() => setEdgeColor('#ef4444')} className="w-6 h-6 rounded-full bg-red-500 hover:ring-2 ring-offset-1 ring-red-500" title="Critical (Red)" />
             <button onClick={() => setEdgeColor('#a855f7')} className="w-6 h-6 rounded-full bg-purple-500 hover:ring-2 ring-offset-1 ring-purple-500" title="Special (Purple)" />
          </div>
        </div>

        {/* SOURCE & TARGET */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-xs text-gray-500 mb-2">Source</p>
          <p className="text-sm font-medium text-gray-900">{selectedEdge.source}</p>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-xs text-gray-500 mb-2">Target</p>
          <p className="text-sm font-medium text-gray-900">{selectedEdge.target}</p>
        </div>

        {/* LABEL */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Connection Label</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g., Approve, Reject"
            value={String(selectedEdge.label || "")}
            onChange={(e) => handleEdgeChange("label", e.target.value)}
          />
        </div>

        {/* CONDITION */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Condition</label>
          <textarea
            className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            placeholder="Optional condition for this flow"
            value={selectedEdge.data?.condition || ""}
            onChange={(e) => handleEdgeChange("condition", e.target.value)}
            rows={3}
          />
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          💡 Connections define the workflow flow between nodes
        </div>
      </div>
    );
  }

  // 🔵 NODE SELECTED
  if (!selectedNode) return null;
  
  const { data } = selectedNode;

  return (
    <div className="w-80 border-l p-4 bg-white shadow-sm overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Node Settings
      </h2>

      {/* TYPE */}
      <p className="text-sm text-gray-500 mb-4 capitalize">
        Type: <span className="font-semibold">{data.label === "task" ? "Task" : data.label === "approval" ? "Approval" : data.label === "automation" ? "Automation" : data.label === "start" ? "Start" : "End"}</span>
      </p>

      {/* DYNAMIC FORM BASED ON NODE TYPE */}
      {data.label === "task" && <TaskForm node={selectedNode} />}

      {data.label === "approval" && <ApprovalForm node={selectedNode} />}

      {data.label === "automation" && <AutomationForm node={selectedNode} />}

      {data.label === "end" && <EndForm node={selectedNode} />}

      {data.label === "start" && <StartForm node={selectedNode} />}
    </div>
  );
}