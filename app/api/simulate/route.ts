import { NextResponse } from "next/server";

interface Node {
  id: string;
  type: string;
}

interface Edge {
  from: string;
  to: string;
  branch?: string;
}

function hasCycle(nodes: any[], edges: any[]) {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};

  // initialize
  nodes.forEach(n => {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  });

  // build graph
  edges.forEach(e => {
    adj[e.from].push(e.to);
    if (!inDegree[e.to]) inDegree[e.to] = 0;
    inDegree[e.to]++;
  });

  // queue (start nodes)
  const queue = Object.keys(inDegree).filter(id => inDegree[id] === 0);

  let visitedCount = 0;

  while (queue.length > 0) {
    const node = queue.shift()!;
    visitedCount++;

    for (const nei of adj[node]) {
      inDegree[nei]--;
      if (inDegree[nei] === 0) {
        queue.push(nei);
      }
    }
  }

  if (visitedCount !== nodes.length) {
    const cycleNodes = Object.keys(inDegree).filter(id => inDegree[id] > 0);
    const nodeNames = cycleNodes.map(id => {
      const node = nodes.find(n => n.id === id);
      return node ? (node.type || id) : id;
    });
    return { hasCycle: true, details: `Loop detected involving: ${nodeNames.join(", ")}` };
  }

  return { hasCycle: false };
}

export async function POST(req: Request) {
  const { nodes, edges, decision } = await req.json() as {
    nodes: Node[];
    edges: Edge[];
    decision?: "approve" | "reject";
  };

  console.log("📥 API received:", {
    nodeCount: nodes.length,
    nodeTypes: nodes.map(n => n.type),
    edgeCount: edges.length,
    decision,
  });

  const cycleCheck = hasCycle(nodes, edges);
  if (cycleCheck.hasCycle) {
    return NextResponse.json(
      { error: cycleCheck.details },
      { status: 400 }
    );
  }

  try {
    const visited = new Set<string>();
    const steps: string[][] = [];

    // 🔍 Find START node
    let currentLevel = nodes
      .filter((n: Node) => (n.type || "").toLowerCase() === "start")
      .map((n: Node) => n.id);

    if (currentLevel.length === 0) {
      console.error("❌ No start node found. Available types:", nodes.map(n => n.type));
      return NextResponse.json(
        { error: "No start node found" },
        { status: 400 }
      );
    }

    // 🔁 Traverse graph
    while (currentLevel.length > 0) {
      console.log(`📍 Step ${steps.length + 1}:`, currentLevel);
      steps.push(currentLevel);

      currentLevel.forEach((id: string) => visited.add(id));

      const nextLevel: string[] = [];

      for (const node of nodes) {
        if (visited.has(node.id)) continue;

        // 🔧 Check edges coming INTO this node (e.to === node.id)
        const incoming = edges.filter((e: Edge) => e.to === node.id);

        if (incoming.length === 0) continue;

        // 🔥 Step 1: Filter for RELEVANT edges (matching the decision)
        const relevantIncoming = incoming.filter((e: Edge) => {
          if (e.branch === "approve" && decision !== "approve") return false;
          if (e.branch === "reject" && decision !== "reject") return false;
          return true;
        });

        // 🟢 Step 2: Check which relevant edges have visited parents
        const validParents = relevantIncoming.filter((e: Edge) => visited.has(e.from));

        // ✅ Node is ready if ALL relevant parents are visited
        if (relevantIncoming.length > 0 && validParents.length === relevantIncoming.length) {
          console.log(`✅ Adding node ${node.id} to nextLevel`);
          nextLevel.push(node.id);
        }
      }

      console.log(`🔄 Next level:`, nextLevel);
      currentLevel = nextLevel;
    }

    console.log(`✅ Simulation complete. Steps:`, steps);

    return NextResponse.json({ success: true, steps });
  } catch (err) {
    console.error("Simulation error:", err);
    return NextResponse.json(
      { error: "Simulation failed" },
      { status: 500 }
    );
  }
}
