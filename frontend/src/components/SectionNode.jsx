import React from "react";

// Create background section nodes for graph groups
export const createSectionNode = (id, label, nodes, color) => {
  if (nodes.length === 0) return null;

  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 100;
  const PADDING_X = 50;
  const PADDING_TOP = 90;
  const PADDING_BOTTOM = 40;

  const minX = Math.min(...nodes.map((node) => node.position.x));
  const minY = Math.min(...nodes.map((node) => node.position.y));

  const maxX = Math.max(...nodes.map((node) => node.position.x + NODE_WIDTH));

  const maxY = Math.max(...nodes.map((node) => node.position.y + NODE_HEIGHT));

  return {
    id,
    type: "section",
    position: {
      x: minX - PADDING_X,
      y: minY - PADDING_TOP,
    },
    draggable: false,
    selectable: false,
    connectable: false,
    zIndex: -1,
    style: {
      width: maxX - minX + PADDING_X * 2,
      height: maxY - minY + PADDING_TOP + PADDING_BOTTOM,
      background: color,
      border: "1px solid #c7d2fe",
      borderRadius: "18px",
      padding: "15px",
      pointerEvents: "none",
    },
    data: { label },
  };
};

// Style section heading with balanced typography
const SectionNode = ({ data }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        padding: "12px 18px",
        fontSize: "23px",
        fontWeight: "700",
        color: "#3730a3",
        pointerEvents: "none",
      }}
    >
      {data.label}
    </div>
  );
};

// Register custom section node with React Flow
export const nodeTypes = {
  section: SectionNode,
};
