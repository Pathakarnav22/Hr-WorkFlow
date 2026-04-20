export type NodeType = "start" | "task" | "approval" | "automation" | "end";

export interface WorkflowNodeData {
  label: string;
  config?: Record<string, string | string[] | boolean | number>;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  data: WorkflowNodeData;
  position: { x: number; y: number };
}