# HR Workflow Designer

The **HR Workflow Designer** is a sleek, modern, and highly interactive drag-and-drop workflow builder designed for human resources and operations teams. Built using React Flow and Next.js, it allows users to construct complex logical paths, configure custom actions, and visually simulate workflow execution with path validation and infinite loop detection.

## Features

- **Interactive Drag-and-Drop Canvas:** Seamlessly build workflows using an intuitive interface backed by React Flow.
- **Dynamic 4-Sided Connectivity:** Nodes feature intelligent, fully bidirectional connection slots (Top, Bottom, Left, Right) utilizing Loose Connection Mode for maximum flexibility.
- **Premium User Interface:** Experience a modern, glassmorphic layout featuring interactive micro-animations, Lucide React icons, and a metallic finish on nodes.
- **Live Workflow Simulation:** Visually execute your workflow step-by-step. The system lights up the active path, evaluating logic branches (e.g., Approve vs. Reject scenarios).
- **Advanced Path Validation:** Built-in graph traversal logic automatically detects infinite cycles, orphaned nodes, and missing Start/End constraints before allowing a simulation to run.
- **Robust State Management:** Full Undo & Redo history support via centralized Zustand stores.
- **JSON Export:** Instantly export constructed workflow graphs for deployment or saving state.

## Architecture

- **Frontend Framework:** Next.js (App Router), React 19, TypeScript
- **Styling & Aesthetics:** Tailwind CSS v4, Lucide-React for iconography
- **Workflow Engine:** React Flow (v11) handling SVG rendering, viewport scaling, and edge routing.
- **State Management:** Zustand, providing a scalable, centralized data store across the Header, Sidebar, Canvas, and Simulation panels.
- **Backend/Simulation API:** Next.js Serverless Route Handlers (`app/api/simulate/route.ts`). Graph parsing and validation occur on the backend for security and accuracy before returning execution steps.

## Folder Structure

```text
/app
  /api                  # Next.js Route handlers (Backend simulation logic)
  globals.css           # Global stylesheets and Tailwind configurations
  page.tsx              # Main viewport layout housing the ReactFlowProvider

/components
  /canvas               # Core React Flow UI elements
    CustomNode.tsx      # Configurable logic nodes with handles & styling
    edges.tsx           # Custom bezier curve logic and hover interactions
    WorkflowCanvas.tsx  # Canvas drop zones and connection handlers
  /layout               # Persistent application structure
    Header.tsx          # Top navigation, global tools, and view controls
    Sidebar.tsx         # Node palette for drag-and-drop
    RightPanel.tsx      # Configuration forms for active nodes/edges
  /simulation           # Execution visuals
    SimulationPanel.tsx # Output logs and active step visualizer

/store
  workflowStore.ts      # Zustand logic: Nodes, Edges, History, Simulation
```

## How Simulation Works

1. **Trigger:** Users define a specific decision condition (e.g., "Approve Path") using the header controls and click "Run Workflow".
2. **Data Transmission:** The current graph (Nodes + Edges) and the global active decision are dispatched to the backend API (`/api/simulate`).
3. **Graph Validation:** The backend uses Kahn's Algorithm / In-degree metrics to identify any invalid graph cycles or unlinked nodes.
4. **Execution Traversal:** A Graph BFS/DFS traversal begins at the `Start` node. As it travels down paths, it evaluates branch rules. If an `Approval` node is hit, the traversal strictly follows the edge mapping to the active decision (ignoring the rejected path).
5. **Animation Payload:** The API responds with a sequential array of successfully executed Node IDs.
6. **Visual Feedback:** The Zustand store receives these IDs and triggers a timed loop, pulsating and highlighting the corresponding nodes on the canvas step-by-step.

## Assumptions

- **Single Entry Point:** Every valid workflow must contain exactly one `Start` node.
- **Termination:** Workflows must route logically to an `End` node to be considered a fully completed path.
- **Acyclic Requirement:** Workflows represent automated linear/branched processes. They must not loop infinitely into themselves (cycles are blocked).
- **Global Decisions:** For the simulation payload, decisions mimicking human intervention (Approve/Reject) apply uniformly across the execution chain for simplicity.

## Future Improvements

- **Database Layer Integration:** Implement PostgreSQL/Supabase to authenticate users, save layouts to accounts, and load past designs.
- **Granular Approval Decisions:** Allow users to pre-program decisions at a per-node level rather than a global simulation-wide selection.
- **Live Webhook Executions:** Bind real REST APIs or internal backend services to "Automation" nodes to trigger real-world emails, SLA pings, or database updates when a workflow executes.
- **Dark/Light Mode:** Full architectural integration of `next-themes` to support system-level theme toggling seamlessly across all UI components.
