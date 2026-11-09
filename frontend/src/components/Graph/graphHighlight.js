// Highlight selected file and its directly connected nodes
export function getHighlightedGraph(layoutedNodes, layoutedEdges, selectedNode) {

  // Store IDs of selected file and its directly connected files
  const connectedNodeIds = new Set();

  if (selectedNode) {
    connectedNodeIds.add(selectedNode);

    layoutedEdges.forEach((edge) => {
      if (edge.source === selectedNode) {
        connectedNodeIds.add(edge.target);
      }

      if (edge.target === selectedNode) {
        connectedNodeIds.add(edge.source);
      }
    });
  }

  // Highlight selected node and fade unrelated nodes
  const highlightedNodes = layoutedNodes.map((node) => ({
    ...node,
    style: {
      ...node.style,

      // Fade unrelated files
      opacity: selectedNode && !connectedNodeIds.has(node.id) ? 0.2 : 1,

      // Highlight selected file with a prominent border
      border:
        node.id === selectedNode ? "3px solid #4f46e5" : node.style?.border,
    },
  }));

  // Highlight edges connected to the selected file
  const highlightedEdges = layoutedEdges.map((edge) => ({
    ...edge,
    style: {
      ...edge.style,

      // Fade unrelated edges
      opacity: selectedNode
        ? edge.source === selectedNode || edge.target === selectedNode
          ? 1
          : 0.1
        : 1,
    },
  }));

  return { highlightedNodes, highlightedEdges };
}