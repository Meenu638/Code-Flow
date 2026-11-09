import { getConnectedGroups } from "./connectedGroups";
import dagre from "@dagrejs/dagre";

// Calculate positions of nodes using Dagre and separate connected/isolated groups
export const getLayoutedElements = (nodes, edges) => {
  const groups = getConnectedGroups(nodes, edges);
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 100;
  const GROUP_GAP = 100;
  const GRID_GAP_X = 100;
  const GRID_GAP_Y = 160;
  const MAX_ROW_WIDTH = 1800;

  const components = groups.map((group) => {
    const groupIds = new Set(group);

    const groupNodes = group.map((id) => nodeMap.get(id)).filter(Boolean);

    const groupEdges = edges.filter(
      (edge) => groupIds.has(edge.source) && groupIds.has(edge.target),
    );

    const graph = new dagre.graphlib.Graph();

    graph.setDefaultEdgeLabel(() => ({}));

    graph.setGraph({
      rankdir: "LR",
      nodesep: 45,
      ranksep: 80,
      marginx: 20,
      marginy: 20,
    });

    groupNodes.forEach((node) => {
      graph.setNode(node.id, {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    });

    groupEdges.forEach((edge) => {
      graph.setEdge(edge.source, edge.target);
    });

    dagre.layout(graph);

    const positions = groupNodes.map((node) => {
      const position = graph.node(node.id);

      return {
        ...node,
        position: {
          x: position.x - NODE_WIDTH / 2,
          y: position.y - NODE_HEIGHT / 2,
        },
      };
    });

    const minX = Math.min(...positions.map((node) => node.position.x));
    const minY = Math.min(...positions.map((node) => node.position.y));

    const normalizedNodes = positions.map((node) => ({
      ...node,
      position: {
        x: node.position.x - minX,
        y: node.position.y - minY,
      },
    }));

    const width = Math.max(
      ...normalizedNodes.map((node) => node.position.x + NODE_WIDTH),
    );

    const height = Math.max(
      ...normalizedNodes.map((node) => node.position.y + NODE_HEIGHT),
    );

    return {
      nodes: normalizedNodes,
      width,
      height,
      size: group.length,
    };
  });

  // Separate connected and isolated components
  const connectedComponents = components
    .filter((component) => component.size > 1)
    .sort((a, b) => b.size - a.size);

  const isolatedComponents = components.filter(
    (component) => component.size === 1,
  );

  const positionedNodes = [];

  let cursorX = 0;
  let cursorY = 0;
  let rowHeight = 0;
  let connectedBottom = 0;

  // STEP 1: Position connected groups in upper section
  connectedComponents.forEach((component) => {
    if (cursorX > 0 && cursorX + component.width > MAX_ROW_WIDTH) {
      cursorX = 0;
      cursorY += rowHeight + GRID_GAP_Y;
      rowHeight = 0;
    }

    component.nodes.forEach((node) => {
      positionedNodes.push({
        ...node,
        position: {
          x: node.position.x + cursorX,
          y: node.position.y + cursorY,
        },
      });
    });

    cursorX += component.width + GROUP_GAP;

    rowHeight = Math.max(rowHeight, component.height);

    connectedBottom = Math.max(connectedBottom, cursorY + component.height);
  });

  // STEP 2: Position isolated files in lower section
  const isolatedStartY =
    connectedComponents.length > 0 ? connectedBottom + 200 : 0;

  const ISOLATED_COLUMNS = 5;

  isolatedComponents.forEach((component, index) => {
    const column = index % ISOLATED_COLUMNS;
    const row = Math.floor(index / ISOLATED_COLUMNS);

    component.nodes.forEach((node) => {
      positionedNodes.push({
        ...node,
        position: {
          x: column * (NODE_WIDTH + GRID_GAP_X),
          y: isolatedStartY + row * (NODE_HEIGHT + GRID_GAP_Y),
        },
      });
    });
  });

  // Preserve only edges whose endpoints exist
  const validNodeIds = new Set(positionedNodes.map((node) => node.id));

  const validEdges = edges.filter(
    (edge) => validNodeIds.has(edge.source) && validNodeIds.has(edge.target),
  );

  return {
    nodes: positionedNodes,
    edges: validEdges,
  };
};