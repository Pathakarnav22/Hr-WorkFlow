"use client";

import { Handle, Position, NodeProps, useStore } from "reactflow";
import { useWorkflowStore } from "@/store/workflowStore";
import { Trash2, PlayCircle, ListTodo, CheckCircle, Zap, StopCircle } from "lucide-react";

export default function CustomNode({ data, id }: NodeProps) {
  const { simulationSteps, currentStep, isSimulating, setNodes, saveHistory } = useWorkflowStore();
  const connectionNodeId = useStore((s) => s.connectionNodeId);

  const isConnecting = !!connectionNodeId && connectionNodeId !== id;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveHistory();
    setNodes((nds) => nds.filter((n) => n.id !== id));
  };

  const isActive =
    isSimulating &&
    Array.isArray(simulationSteps[currentStep]) &&
    simulationSteps[currentStep].includes(id);

  const colorMap: Record<string, string> = {
    start: "bg-gradient-to-br from-green-400 via-green-500 to-green-600 border border-green-400/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_4px_6px_rgba(0,0,0,0.15)]",
    task: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 border border-blue-400/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_4px_6px_rgba(0,0,0,0.15)]",
    approval: "bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 border border-purple-400/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_4px_6px_rgba(0,0,0,0.15)]",
    automation: "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 border border-orange-400/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_4px_6px_rgba(0,0,0,0.15)]",
    end: "bg-gradient-to-br from-red-400 via-red-500 to-red-600 border border-red-400/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_4px_6px_rgba(0,0,0,0.15)]",
  };

  const color = colorMap[data.label?.toLowerCase() || ""] || "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 border-gray-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]";

  const getIcon = () => {
    switch (data.label?.toLowerCase()) {
      case "start": return <PlayCircle size={16} className="drop-shadow-sm text-white/90" />;
      case "task": return <ListTodo size={16} className="drop-shadow-sm text-white/90" />;
      case "approval": return <CheckCircle size={16} className="drop-shadow-sm text-white/90" />;
      case "automation": return <Zap size={16} className="drop-shadow-sm text-white/90" />;
      case "end": return <StopCircle size={16} className="drop-shadow-sm text-white/90" />;
      default: return null;
    }
  };

  return (
    <div
      className={`group relative rounded-xl px-4 py-3 min-w-[150px] text-white ${color} transition-all duration-300 transform ${
        isActive 
          ? "ring-4 ring-yellow-300 ring-offset-2 shadow-lg shadow-yellow-300/50 animate-pulse scale-105" 
          : isConnecting
          ? "ring-2 ring-blue-300 ring-offset-2 animate-pulse scale-105"
          : "hover:scale-[1.02] hover:shadow-xl"
      }`}
    >
      {/* 🗑️ Delete Button (Visible on Hover) */}
      <button
        onClick={handleDelete}
        title="Delete Node"
        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
      >
        <Trash2 size={14} strokeWidth={2.5} />
      </button>

      {/* 🔵 Top Target */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-blue-400 border-2 border-white rounded-full shadow-md cursor-crosshair hover:bg-blue-600 transition hover:scale-125"
        isConnectable={data.label?.toLowerCase() !== "start"}
      />

      {/* 🔵 Left Target (Disabled for Approval & Start) */}
      {data.label?.toLowerCase() !== "approval" && (
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="w-3 h-3 bg-blue-400 border-2 border-white rounded-full shadow-md cursor-crosshair hover:bg-blue-600 transition hover:scale-125"
          isConnectable={data.label?.toLowerCase() !== "start"}
        />
      )}

      {/* 🧠 Node Content */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-semibold capitalize tracking-wide text-white drop-shadow-md">
            {data.label}
          </span>
        </div>

        {data.description && (
          <span className="text-xs opacity-80">
            {data.description}
          </span>
        )}

        {/* Simulation Step Indicator */}
        {isActive && (
          <span className="text-xs bg-yellow-400 text-gray-900 rounded px-2 py-1 font-bold">
            Step {currentStep + 1}
          </span>
        )}
      </div>

      {/* 🔵 Bottom & Right Sources (Disabled for End nodes) */}
      {data.label?.toLowerCase() === "approval" ? (
        <>
          {/* LEFT = REJECT */}
          <Handle
            type="source"
            position={Position.Left}
            id="reject"
            className="w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-md cursor-crosshair hover:bg-red-600 transition hover:scale-125 opacity-100"
            isConnectable={true}
          />
          <span className="absolute left-[-55px] top-1/2 -translate-y-1/2 text-xs text-red-600 font-medium whitespace-nowrap pointer-events-none">
            Reject ❌
          </span>

          {/* RIGHT = APPROVE */}
          <Handle
            type="source"
            position={Position.Right}
            id="approve"
            className="w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-md cursor-crosshair hover:bg-green-600 transition hover:scale-125 opacity-100"
            isConnectable={true}
          />
          <span className="absolute right-[-60px] top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium whitespace-nowrap pointer-events-none">
            Approve ✅
          </span>
        </>
      ) : (
        <>
          {/* Default Bottom Source */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            className="w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-md cursor-crosshair hover:bg-green-600 transition hover:scale-125"
            isConnectable={data.label?.toLowerCase() !== "end"}
          />
          {/* Right Source */}
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            className="w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-md cursor-crosshair hover:bg-green-600 transition hover:scale-125"
            isConnectable={data.label?.toLowerCase() !== "end"}
          />
        </>
      )}
    </div>
  );
}