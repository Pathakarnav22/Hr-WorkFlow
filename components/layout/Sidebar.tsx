"use client";

import { PlayCircle, ListTodo, CheckCircle, Zap, StopCircle } from "lucide-react";

const nodes = [
  { type: "start", label: "Start", icon: PlayCircle, color: "text-green-500" },
  { type: "task", label: "Task", icon: ListTodo, color: "text-blue-500" },
  { type: "approval", label: "Approval", icon: CheckCircle, color: "text-purple-500" },
  { type: "automation", label: "Automation", icon: Zap, color: "text-orange-500" },
  { type: "end", label: "End", icon: StopCircle, color: "text-red-500" },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, type: string) => {
    event.dataTransfer.setData("application/reactflow", type);
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out bg-white border-r shadow-sm overflow-hidden flex flex-col ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Toggle Button Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0 border border-gray-300"
          title={isOpen ? "Collapse" : "Expand"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`text-gray-800 transition-transform duration-300 ${
              !isOpen ? "rotate-180" : "rotate-0"
            }`}
            style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {isOpen && <h2 className="font-bold text-gray-900 text-sm">Node Palette</h2>}
      </div>

      {/* Node List */}
      <div className={`overflow-y-auto flex-1 ${isOpen ? "p-4" : "p-0"}`}>
        <div className={isOpen ? "space-y-3" : "space-y-2 p-2"}>
          {nodes.map((node) => (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
              className={`flex items-center rounded-lg hover:bg-gray-100 cursor-move transition-colors ${
                isOpen
                  ? "gap-3 p-3 bg-gray-50 border border-gray-200"
                  : "gap-0 p-2 justify-center"
              }`}
              title={isOpen ? "" : node.label}
            >
              <div className={`flex-shrink-0 flex items-center justify-center ${node.color}`}>
                <node.icon size={isOpen ? 20 : 18} strokeWidth={2.5} />
              </div>
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {node.label}
                  </p>
                  <p className="text-xs text-gray-500">Drag to canvas</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}