"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import WorkflowCanvas from "@/components/canvas/WorkflowCanvas";
import RightPanel from "@/components/layout/RightPanel";
import SimulationPanel from "@/components/simulation/SimulationPanel";
import { ReactFlowProvider } from "reactflow";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <Header />

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

          {/* Canvas */}
          <WorkflowCanvas />

          {/* Right Panel */}
          <RightPanel />
        </div>

        {/* Simulation Panel */}
        <SimulationPanel />
      </div>
    </ReactFlowProvider>
  );
}