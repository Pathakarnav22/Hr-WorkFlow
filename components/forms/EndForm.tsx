"use client";

import { useWorkflowStore } from "@/store/workflowStore";
import { Node } from "reactflow";

interface EndFormProps {
  node: Node;
}

export default function EndForm({ node }: EndFormProps) {
  const { updateNodeData } = useWorkflowStore();

  const handleMessageChange = (value: string) => {
    updateNodeData(node.id, { message: value });
  };

  const handleSummaryToggle = (value: boolean) => {
    updateNodeData(node.id, { summary: value });
  };

  return (
    <div className="space-y-4">
      {/* END MESSAGE */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          End Message
        </label>
        <textarea
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm"
          placeholder="Enter completion message"
          value={node.data.message || ""}
          onChange={(e) => handleMessageChange(e.target.value)}
          rows={3}
        />
      </div>

      {/* SUMMARY FLAG */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Generate Summary
        </label>
        <input
          type="checkbox"
          checked={node.data.summary || false}
          onChange={(e) => handleSummaryToggle(e.target.checked)}
          className="w-4 h-4 accent-red-500"
        />
      </div>

      {/* INFO */}
      <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
        🏁 End node represents workflow completion. You can show a final message or generate a summary.
      </div>
    </div>
  );
}