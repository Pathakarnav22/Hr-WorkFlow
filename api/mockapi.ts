export const fetchAutomations = async () => {
  return [
    {
      id: "send_email",
      label: "Send Email",
      params: ["to", "subject"],
    },
    {
      id: "generate_doc",
      label: "Generate Document",
      params: ["template", "recipient"],
    },
  ];
};

export async function simulateWorkflow(payload: {
  nodes: Array<{ id: string; type: string }>;
  edges: Array<{ from: string; to: string; branch?: string }>;
  decision?: "approve" | "reject";
}) {
  console.log("📡 Calling /api/simulate with:", payload);

  const response = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Simulation API failed");
  }

  const result = await response.json();
  console.log("✅ API Response:", result);

  return result;
}