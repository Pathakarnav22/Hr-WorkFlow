"use client";

import { useState } from "react";
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
} from "reactflow";
import { Trash2 } from "lucide-react";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  markerEnd,
  label,
}: EdgeProps) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer"
    >
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} interactionWidth={25} />

      {/* LABEL FOR CUSTOM EDGES (INCLUDING STANDARD LABELS) */}
      {label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: 12, fill: "#555", fontWeight: "bold" }}
            startOffset="50%"
            textAnchor="middle"
          >
            {label}
          </textPath>
        </text>
      )}

      {/* LABEL FOR APPROVAL BRANCHES */}
      {data?.branch && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: 12, fill: "#555", fontWeight: "bold" }}
            startOffset="50%"
            textAnchor="middle"
          >
            {data.branch === "approve" ? "✅ Approve" : ""}
            {data.branch === "reject" ? "❌ Reject" : ""}
          </textPath>
        </text>
      )}

      {/* HOVER DELETE BUTTON */}
      <EdgeLabelRenderer>
        <div
          style={{
             position: 'absolute',
             transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
             pointerEvents: 'all',
          }}
          className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (data?.onDelete) data.onDelete(id);
            }}
            title="Delete Connection"
            className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-md transform hover:scale-110 transition-transform"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </g>
  );
}