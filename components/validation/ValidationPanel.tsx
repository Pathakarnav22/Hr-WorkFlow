"use client";

import { useWorkflowStore } from "@/store/workflowStore";

export default function ValidationPanel() {
  const { validationErrors } = useWorkflowStore();

  if (validationErrors.length === 0) return null;

  return (
    <div className="absolute top-16 right-4 bg-red-50 border border-red-300 p-4 rounded shadow w-80 z-50">
      <h4 className="text-red-600 font-semibold mb-2">
        ⚠️ Workflow Issues
      </h4>

      <ul className="text-sm text-red-700 list-disc pl-4 space-y-1">
        {validationErrors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>
    </div>
  );
}
