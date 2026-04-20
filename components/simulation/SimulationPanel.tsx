"use client";

import { useWorkflowStore } from "@/store/workflowStore";
import { useEffect, useState } from "react";

export default function SimulationPanel() {
  const {
    simulationSteps,
    currentStep,
    isSimulating,
    nodes,
    edges,
    stopSimulation,
    nextStep,
    isLoading,
    decision,
  } = useWorkflowStore();
  
  const [autoPlay, setAutoPlay] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const isComplete = currentStep >= simulationSteps.length - 1;

  // Auto-advance steps with 2-second delay
  useEffect(() => {
    if (!isSimulating || !autoPlay || isLoading || isComplete) return;

    const timer = setTimeout(() => {
      nextStep();
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSimulating, autoPlay, isLoading, currentStep, isComplete]);

  if (!isSimulating || !panelOpen) return null;

  // Helper: Generate dynamic log message based on node type and data
  const generateLog = (nodeId: string): string => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return "Unknown node";

    const nodeType = node.data.label?.toLowerCase();

    if (nodeType === "start") {
      return "🚀 Workflow started";
    }

    if (nodeType === "approval") {
      if (decision === "approve") {
        return `🟣 Approved by ${node.data.role || "manager"}`;
      } else {
        return `🔴 Rejected by ${node.data.role || "manager"}`;
      }
    }

    if (nodeType === "automation") {
      const action = node.data.action;
      const params = node.data.params || {};

      if (action === "send_email") {
        return `📧 Email sent to ${params.to || "recipient"} with subject "${params.subject || "no subject"}"`;
      } else if (action === "generate_doc") {
        return `📄 Document generated for ${params.recipient || "requester"}`;
      } else {
        return `⚙️ Executed ${action || "automation"}`;
      }
    }

    if (nodeType === "task") {
      return `👤 Task assigned to ${node.data.assignee || "Unassigned"} (Due: ${node.data.dueDate || "N/A"})`;
    }

    if (nodeType === "end") {
      return "🏁 Workflow completed";
    }

    return `▶ Executed ${nodeType || "node"}`;
  };

  const successfulSteps = currentStep;

  const workflowJson = {
    nodes: nodes.map((n) => ({
      id: n.id,
      label: n.data.label,
      type: n.data.label,
    })),
    edges: edges.map((e) => ({
      from: e.source,
      to: e.target,
      branch: e.data?.branch || "default",
    })),
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50 flex flex-col max-h-96 animate-in slide-in-from-bottom">
      {/* Header with Controls */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-800">
            🎬 Active Simulation
          </span>
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            isComplete 
              ? "bg-green-100 text-green-700" 
              : "bg-blue-100 text-blue-700 animate-pulse"
          }`}>
            {isComplete ? "✅ Complete" : "🔴 Live"}
          </span>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={nextStep}
            disabled={isLoading || isComplete}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ▶ Next
          </button>

          <button
            onClick={() => {
              setPanelOpen(false);
              stopSimulation();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors"
          >
            ✖ Close
          </button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Source Context */}
        <div className="flex-1 border-r flex flex-col p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-800">SOURCE CONTEXT</h4>
            <span className="text-xs text-gray-500">Auto-refresh</span>
          </div>

          {/* JSON Display */}
          <div className="flex-1 overflow-y-auto bg-gray-900 rounded p-3 text-xs font-mono text-green-400">
            <pre>{JSON.stringify(workflowJson, null, 2)}</pre>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            HR Workflow Designer v1.2.0
          </div>
        </div>

        {/* Right: Execution Log */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-800">EXECUTION LOG</h4>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="font-medium text-gray-700">
                  {successfulSteps} Successful
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${
                  isComplete ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                }`}></span>
                <span className="font-medium text-gray-700">
                  {isComplete ? "Completed" : `Step ${currentStep + 1}/${simulationSteps.length}`}
                </span>
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
              style={{
                width: `${((currentStep + 1) / simulationSteps.length) * 100}%`,
              }}
            />
          </div>

          {/* Steps Timeline or Completion Card */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {isComplete ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  {/* Celebration SVG */}
                  <svg
                    className="w-24 h-24 mx-auto mb-4 text-green-500 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12l2 2 4-4"
                    />
                  </svg>

                  {/* Completion Message */}
                  <h3 className="text-2xl font-bold text-green-600 mb-2">
                    Workflow Complete! 🎉
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    All {simulationSteps.length} steps executed successfully
                  </p>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-xs text-gray-600">Total Steps</p>
                      <p className="text-lg font-bold text-green-600">
                        {simulationSteps.length}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <p className="text-xs text-gray-600">Status</p>
                      <p className="text-lg font-bold text-green-600">Success</p>
                    </div>
                  </div>

                  {/* Execution Time Info */}
                  <p className="text-xs text-gray-500">
                    Workflow executed without errors
                  </p>
                </div>
              </div>
            ) : (
              simulationSteps.map((step: string[], levelIndex: number) => {
                const isCompleted = levelIndex <= currentStep;
                const isActive = levelIndex === currentStep && !isComplete;

                return (
                  <div key={levelIndex} className="flex gap-3">
                    {/* Status Indicator */}
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isActive
                            ? "bg-yellow-400 text-white scale-110 shadow-lg shadow-yellow-400/50 animate-pulse"
                            : "bg-gray-300 text-white"
                        }`}
                      >
                        {isCompleted ? "✓" : isActive ? "●" : levelIndex + 1}
                      </div>
                      {levelIndex < simulationSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-6 transition-colors ${
                            isCompleted ? "bg-green-400" : "bg-gray-300"
                          }`}
                        ></div>
                      )}
                    </div>

                    {/* Step Details */}
                    <div className="flex-1">
                      <div className={`p-3 rounded border transition-all ${
                        isActive
                          ? "bg-yellow-50 border-yellow-300 shadow-md"
                          : isCompleted
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-800">
                            {step
                              .map(
                                (id) =>
                                  nodes.find((n) => n.id === id)?.data?.label ||
                                  id
                              )
                              .join(", ")}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium transition-all ${
                              isCompleted
                                ? "bg-green-100 text-green-700"
                                : isActive
                                ? "bg-yellow-100 text-yellow-700 animate-pulse"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isCompleted
                              ? "Completed"
                              : isActive
                              ? "Processing..."
                              : "Pending"}
                          </span>
                        </div>

                        {/* Dynamic Logs for each node in step */}
                        <div className="space-y-1">
                          {step.map((nodeId: string) => (
                            <p key={nodeId} className="text-xs text-gray-700">
                              {generateLog(nodeId)}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}