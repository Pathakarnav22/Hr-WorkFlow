"use client";

import { useWorkflowStore } from "@/store/workflowStore";
import { Node } from "reactflow";

interface StartFormProps {
  node: Node;
}

export default function StartForm({ node }: StartFormProps) {
  const { updateNodeData } = useWorkflowStore();

  const metadata: Record<string, string> = node.data.metadata || {};

  const handleTitleChange = (value: string) => {
    updateNodeData(node.id, { label: value });
  };

  const handleMetaChange = (key: string, value: string) => {
    updateNodeData(node.id, {
      metadata: {
        ...metadata,
        [key]: value,
      },
    });
  };

  const handleAddField = () => {
    const newKey = `key_${Date.now()}`;
    updateNodeData(node.id, {
      metadata: {
        ...metadata,
        [newKey]: "",
      },
    });
  };

  const handleDeleteField = (key: string) => {
    const updated = { ...metadata };
    delete updated[key];

    updateNodeData(node.id, { metadata: updated });
  };

  return (
    <div className="space-y-4">
      {/* TITLE */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Start Title
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Enter start title"
          value={node.data.label || ""}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
      </div>

      {/* METADATA */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Metadata (Key-Value)
          </label>
          <button
            onClick={handleAddField}
            className="text-xs bg-green-500 text-white px-2 py-1 rounded"
          >
            + Add
          </button>
        </div>

        {Object.entries(metadata).length === 0 && (
          <p className="text-xs text-gray-400">
            No metadata added
          </p>
        )}

        <div className="space-y-2">
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              {/* KEY */}
              <input
                type="text"
                value={key}
                disabled
                className="w-1/3 border border-gray-300 p-2 rounded bg-gray-100 text-xs"
              />

              {/* VALUE */}
              <input
                type="text"
                value={value}
                onChange={(e) =>
                  handleMetaChange(key, e.target.value)
                }
                className="w-2/3 border border-gray-300 p-2 rounded text-xs"
                placeholder="Value"
              />

              {/* DELETE */}
              <button
                onClick={() => handleDeleteField(key)}
                className="text-red-500 text-xs px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* INFO */}
      <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-700">
        🚀 Start node defines workflow entry point. Metadata can store initial context like employee info, request type, etc.
      </div>
    </div>
  );
}