"use client";

import { useWorkflowStore } from "@/store/workflowStore";
import { Node } from "reactflow";
import { useEffect, useState, useMemo } from "react";
import { fetchAutomations } from "@/api/mockapi";

interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

interface AutomationFormProps {
  node: Node;
}

export default function AutomationForm({ node }: AutomationFormProps) {
  const { updateNodeData } = useWorkflowStore();

  const [actions, setActions] = useState<AutomationAction[]>([]);

  useEffect(() => {
    fetchAutomations().then(setActions);
  }, []);

  // ✅ Compute selectedAction from actions and node data instead of storing in state
  const selectedAction = useMemo(() => {
    if (!node.data.action || actions.length === 0) return null;
    return actions.find((a) => a.id === node.data.action) || null;
  }, [node.data.action, actions]);

  const handleTitleChange = (value: string) => {
    updateNodeData(node.id, { label: value });
  };

  const handleActionChange = (value: string) => {
    updateNodeData(node.id, {
      action: value,
      params: {},
    });
  };

  const handleDescriptionChange = (value: string) => {
    updateNodeData(node.id, { description: value });
  };

  const handleParamChange = (key: string, value: string) => {
    updateNodeData(node.id, {
      params: {
        ...(node.data.params as Record<string, string> || {}),
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* TITLE */}
      <div>
        <label className="text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter automation title"
          value={node.data.label || ""}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
      </div>

      {/* ACTION */}
      <div>
        <label className="text-sm font-medium text-gray-700">Action</label>
        <select
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={node.data.action || ""}
          onChange={(e) => handleActionChange(e.target.value)}
        >
          <option value="">Select action</option>
          {actions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      {selectedAction &&
        selectedAction.params.map((param: string) => (
          <div key={param}>
            <label className="text-sm font-medium text-gray-700 capitalize">
              {param}
            </label>
            <input
              className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={`Enter ${param}`}
              value={(node.data.params as Record<string, string>)?.[param] || ""}
              onChange={(e) => handleParamChange(param, e.target.value)}
            />
          </div>
        ))}

      {/* DESCRIPTION */}
      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          placeholder="Enter automation details"
          value={node.data.description || ""}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>

      {/* INFO */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
        💡 Automation nodes execute actions automatically without manual intervention.
      </div>
    </div>
  );
}
