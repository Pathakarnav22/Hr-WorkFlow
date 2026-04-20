"use client";

import { useWorkflowStore } from "@/store/workflowStore";
import { simulateWorkflow } from "@/api/mockapi";
import { useCallback, useState } from "react";
import { Undo2, Redo2, Play, Download, Search, Activity, Plus, Minus, Maximize } from "lucide-react";
import { useReactFlow } from "reactflow";

export default function Header() {
  const { nodes, edges, past, future, undo, redo, setSimulation, setLoading, setDecision } = useWorkflowStore();
  const [decision, setDecisionLocal] = useState<"approve" | "reject">("approve");
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleUndo = () => {
    if (past.length > 0) {
      undo();
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      redo();
    }
  };

  const handleRun = useCallback(async () => {
    console.log("=== RUNNING SIMULATION (API) ===");

    const payload = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: (n.data.label || "").toLowerCase(),
      })),
      edges: edges.map((e) => ({
        from: e.source,
        to: e.target,
        branch: e.data?.branch || "default",
      })),
      decision: decision,
    };

    try {
      setLoading(true);
      setDecision(decision);
      const result = await simulateWorkflow(payload);

      console.log("API RESULT:", result);

      if (!result.success) {
        alert("Simulation failed");
        return;
      }

      setSimulation(result.steps);
    } catch (error) {
      console.error("Simulation error:", error);
      alert("Simulation failed!");
    } finally {
      setLoading(false);
    }
  }, [nodes, edges, decision, setSimulation, setLoading, setDecision]);

  const handleExport = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);

    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
  };

  return (
    <div className="h-[64px] flex items-center justify-between px-6 border-b border-gray-200 bg-white shadow-sm select-none">
      
      {/* LEFT: Logo + Title */}
      <div className="flex items-center gap-3 w-1/4">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
          <Activity size={18} className="text-white" />
        </div>
        <h1 className="text-lg font-bold text-blue-600 tracking-tight">
          HR Workflow Designer
        </h1>
      </div>

      {/* CENTER: Search */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-md relative flex items-center">
          <Search className="absolute left-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Find node by name or ID..."
            className="w-full pl-9 pr-4 py-1.5 bg-gray-100 hover:bg-gray-200/70 text-sm border border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md transition-all outline-none text-gray-700 placeholder-gray-500 shadow-inner"
          />
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center justify-end gap-3 w-1/2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 text-gray-500">
          <button onClick={handleUndo} disabled={past.length === 0} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors" title="Undo">
            <Undo2 size={16} />
          </button>
          <button onClick={handleRedo} disabled={future.length === 0} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors" title="Redo">
            <Redo2 size={16} />
          </button>
        </div>

        <div className="w-px h-5 bg-gray-200 mx-1"></div>

        {/* Viewport Controls */}
        <div className="flex items-center gap-1 text-gray-500">
          <button onClick={() => zoomIn()} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Zoom In"><Plus size={16} /></button>
          <button onClick={() => zoomOut()} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Zoom Out"><Minus size={16} /></button>
          <button onClick={() => fitView({ duration: 800 })} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Fit View"><Maximize size={14} /></button>
        </div>

        <div className="w-px h-5 bg-gray-200 mx-1"></div>

        {/* Decision Toggle for Simulation */}
        <select 
          className="text-xs bg-gray-50 border border-gray-200 rounded-md py-1.5 px-2 text-gray-600 outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
          value={decision}
          onChange={(e) => setDecisionLocal(e.target.value as "approve" | "reject")}
        >
          <option value="approve">✅ Approve Path</option>
          <option value="reject">❌ Reject Path</option>
        </select>

        {/* Export JSON */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-all text-xs font-bold shadow-sm"
        >
          <Download size={14} /> Export JSON
        </button>

        {/* Run Workflow */}
        <button
          onClick={handleRun}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all text-xs font-bold shadow-sm"
        >
          <Play size={14} fill="currentColor" /> Run Workflow
        </button>

        {/* Avatar Placeholder */}
        <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs cursor-pointer font-bold ml-1">
          A
        </div>
      </div>
    </div>
  );
}