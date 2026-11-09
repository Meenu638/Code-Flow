// Convert repository nodes and edges into React Flow format
export function prepareGraphData(nodes, edges) {

  // Convert repository files into React Flow nodes
  const flowNodes = nodes.map((node) => ({
    id: node.id,
    position: { x: 0, y: 0 },
    style: {
      width: 280,
      minHeight: 100,
      padding: "20px",
      borderRadius: "14px",
      border: "1px solid #c7d2fe",
      background: "linear-gradient(135deg, #ffffff, #eef2ff)",
      color: "#1e1b4b",
      fontSize: "20px",
      fontWeight: "600",
      boxShadow: "0 8px 24px rgba(79, 70, 229, 0.12)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
    data: {
      label: `📄 ${node.label}`,
    },
  }));

  // Convert repository dependencies into React Flow edges
  const flowEdges = edges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    animated: true,
    style: {
      stroke: "#6366f1",
      strokeWidth: 2,
    },
    markerEnd: {
      type: "arrowclosed",
      color: "#6366f1",
      width: 20,
      height: 20,
    },
  }));

  return { flowNodes, flowEdges };
}