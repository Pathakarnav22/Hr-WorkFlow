```markdown

# HR Workflow Designer (React + React Flow)

A mini visual workflow builder for HR teams to design, configure, and simulate internal processes such as onboarding, approvals, and automation flows.

⸻
Vercel Deployment Link

https://hr-work-flow-ashy.vercel.app


🚀 Features

🖥 Workflow Canvas

* Drag & drop nodes using React Flow
* Connect nodes with edges
* Delete nodes and edges
* Zoom, pan, minimap support

🔧 Node Types

* Start Node – Entry point of workflow
* Task Node – Human task (assignable)
* Approval Node – Decision-based branching (Approve / Reject)
* Automation Node – API-driven automated actions
* End Node – Workflow completion

⸻

📝 Node Configuration Forms

Each node has a dynamic form panel:

Start Node

* Title
* Optional metadata (key-value)

Task Node

* Title (required)
* Description
* Assignee
* Due date
* Custom fields

Approval Node

* Title
* Approver role (Manager / HR / Director)
* Auto-approve threshold

Automation Node

* Title
* Select action (from API)
* Dynamic parameters (based on action)
* Description

End Node

* End message
* Summary flag

⸻

**⚙️ Mock API Layer**

GET /api/automations

Returns available automation actions:
[
  { "id": "send_email", "label": "Send Email", "params": ["to", "subject"] },
  { "id": "generate_doc", "label": "Generate Document", "params": ["template", "recipient"] }
]

POST /api/simulate

Simulates workflow execution.
{
  "steps": [
    ["start"],
    ["task1", "task2"],
    ["approval"],
    ["automation"],
    ["end"]
  ]
}
**Workflow Simulation**

* Step-by-step execution panel
* Highlights active nodes
* Supports parallel execution
* Handles approval branching (approve / reject)
* Uses topological traversal (DAG-based)

⸻

 **Validation System**

* Detects missing start node
* Detects cycles (graph loop prevention)
* Detects disconnected nodes
* Prevents invalid workflows

**Architecture**

components/
  ├── canvas/           → React Flow canvas
  ├── nodes/            → Custom nodes
  ├── edges/            → Custom edges
  ├── forms/            → Node configuration forms
  ├── panels/           → Simulation panel

store/
  └── workflowStore.ts  → Zustand state management

api/
  ├── mockapi.ts        → Frontend API calls
  └── /api/simulate     → Backend simulation API

utils/
  ├── validation.ts     → Graph validation
  └── simulation.ts     → Execution logic

**How Simulation Works**

1. Detect start nodes (no incoming edges)
2. Traverse graph level-by-level
3. Execute nodes only when all parents are completed
4. Support:
    * Parallel execution
    * Approval branching
    * Automation steps
5. Stop when all nodes are visited

⸻

🛠 Tech Stack

* React / Next.js
* React Flow
* Zustand (state management)
* TypeScript
* Tailwind CSS

**Running the Project**
npm install
npm run dev

📌 Assumptions

* Only one start node is required
* Approval decisions are simulated (not user-triggered)
* No backend persistence (in-memory only)
* Workflow must be a DAG (no cycles)

⸻

🚀 Future Improvements

* Save/load workflows (database)
* Real-time execution engine
* User roles & authentication
* Drag constraints (prevent invalid connections)
* Visual execution animations
* Workflow templates

⸻

🏁 Conclusion

This project demonstrates:

* Graph-based workflow design
* Dynamic form handling
* API integration
* Simulation engine design
* Scalable frontend architecture




```
