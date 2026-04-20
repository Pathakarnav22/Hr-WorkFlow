"use client";

import { useWorkflowStore } from "@/store/workflowStore";
import { Node } from "reactflow";

interface ApprovalFormProps {
  node: Node;
}

export default function ApprovalForm({ node }: ApprovalFormProps) {
  const { updateNodeData } = useWorkflowStore();

  const update = (field: string, value: string | number | boolean | Record<string, unknown>) => {
    updateNodeData(node.id, { [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* TITLE */}
      <div>
        <label className="text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter approval title"
          value={node.data.label || ""}
          onChange={(e) => update("label", e.target.value)}
        />
      </div>

      {/* APPROVER ROLE */}
      <div>
        <label className="text-sm font-medium text-gray-700">Approver Role</label>
        <select
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={node.data.role || ""}
          onChange={(e) => update("role", e.target.value)}
        >
          <option value="">Select role</option>
          <option value="Manager">Manager</option>
          <option value="HR">HR</option>
          <option value="Director">Director</option>
        </select>
      </div>

      {/* AUTO APPROVE THRESHOLD ✅ */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Auto-Approve Threshold
        </label>
        <input
          type="number"
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter threshold (e.g. 10000)"
          value={node.data.threshold || ""}
          onChange={(e) => update("threshold", Number(e.target.value))}
        />
        <p className="text-xs text-gray-500 mt-1">
          Auto-approve if value is below this threshold
        </p>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          placeholder="Enter approval details"
          value={node.data.description || ""}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
        />
      </div>

      {/* INFO */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
        💡 Approval nodes require a role and can optionally auto-approve based on conditions.
      </div>
    </div>
  );
}