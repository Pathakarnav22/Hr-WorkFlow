"use client";

import { useWorkflowStore } from "@/store/workflowStore";
import { Node } from "reactflow";

interface TaskFormProps {
  node: Node;
}

export default function TaskForm({ node }: TaskFormProps) {
  const { updateNodeData } = useWorkflowStore();

  const handleTitleChange = (value: string) => {
    updateNodeData(node.id, { label: value });
  };

  const handleDescriptionChange = (value: string) => {
    updateNodeData(node.id, { description: value });
  };

  const handleAssigneeChange = (value: string) => {
    updateNodeData(node.id, { assignee: value });
  };

  const handleDueDateChange = (value: string) => {
    updateNodeData(node.id, { dueDate: value });
  };

  const handleCustomFieldChange = (index: number, key: string, value: string) => {
    const customFields = node.data.customFields || [];
    const updatedFields = [...customFields];
    updatedFields[index] = { key, value };
    updateNodeData(node.id, { customFields: updatedFields });
  };

  const handleAddCustomField = () => {
    const customFields = node.data.customFields || [];
    updateNodeData(node.id, { customFields: [...customFields, { key: "", value: "" }] });
  };

  const handleRemoveCustomField = (index: number) => {
    const customFields = node.data.customFields || [];
    updateNodeData(node.id, {
      customFields: customFields.filter((_: Record<string, string>, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      {/* TITLE (Required) */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter task title"
          value={node.data.label || ""}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          placeholder="Enter task description"
          value={node.data.description || ""}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>

      {/* ASSIGNEE */}
      <div>
        <label className="text-sm font-medium text-gray-700">Assignee</label>
        <input
          type="text"
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter assignee name or email"
          value={node.data.assignee || ""}
          onChange={(e) => handleAssigneeChange(e.target.value)}
        />
      </div>

      {/* DUE DATE */}
      <div>
        <label className="text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="date"
          className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={node.data.dueDate || ""}
          onChange={(e) => handleDueDateChange(e.target.value)}
        />
      </div>

      {/* CUSTOM FIELDS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Custom Fields</label>
          <button
            onClick={handleAddCustomField}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            + Add Field
          </button>
        </div>

        {(node.data.customFields || []).map((field: any, index: number) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Field name"
              value={field.key || ""}
              onChange={(e) => handleCustomFieldChange(index, e.target.value, field.value)}
            />
            <input
              type="text"
              className="flex-1 border border-gray-300 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Field value"
              value={field.value || ""}
              onChange={(e) => handleCustomFieldChange(index, field.key, e.target.value)}
            />
            <button
              onClick={() => handleRemoveCustomField(index)}
              className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* INFO */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
        💡 Fill in task details. Custom fields are optional key-value pairs for additional properties.
      </div>
    </div>
  );
}
