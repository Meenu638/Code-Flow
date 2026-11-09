import { useEffect, useState } from "react";

import { getConnectedGroups } from "../utils/connectedGroups";
import { getLayoutedElements } from "../utils/graphLayout";

import { nodeTypes } from "./SectionNode";

// Import separated graph utility functions
import { prepareGraphData } from "./Graph/graphData";
import { getHighlightedGraph } from "./Graph/graphHighlight";
import { createGraphSections } from "./Graph/graphSection";

// Import file search component
import GraphSearch from "./Graph/graphSearch";

import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Import syntax highlighter and VS Code dark theme
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// Automatically center and zoom the graph on the selected file
function GraphViewport({
  nodes,
  edges,
  nodeTypes,
  selectedNode,
  onNodeClick,
  onPaneClick,
}) {
  const { getNode, setCenter } = useReactFlow();

  // Focus the selected node whenever its selection changes
  useEffect(() => {
    if (!selectedNode) return;

    const node = getNode(selectedNode);

    if (node) {
      const width = node.measured?.width || node.width || 260;
      const height = node.measured?.height || node.height || 100;

      setCenter(node.position.x + width / 2, node.position.y + height / 2, {
        zoom: 0.5,
        duration: 500,
      });
    }
  }, [selectedNode, getNode, setCenter]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.02, maxZoom: 2.5 }}
      minZoom={0.2}
      maxZoom={2.5}
      defaultEdgeOptions={{ type: "smoothstep" }}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      style={{ width: "100%", height: "100%" }}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}

function DependencyGraph({ nodes = [], edges = [], analyzedFiles = [] }) {
  const [selectedNode, setSelectedNode] = useState(null);

  // Find source code of the currently selected file
  const selectedFile = analyzedFiles.find((file) => file.path === selectedNode);

  // Prepare repository nodes and edges for React Flow
  const { flowNodes, flowEdges } = prepareGraphData(nodes, edges);

  // Calculate graph layout before applying highlighting
  const layout = getLayoutedElements(flowNodes, flowEdges);

  const layoutedNodes = layout.nodes;
  const layoutedEdges = layout.edges;

  // Identify connected components in the repository
  const groups = getConnectedGroups(flowNodes, flowEdges);

  // Apply highlighting to selected file and its dependencies
  const { highlightedNodes, highlightedEdges } = getHighlightedGraph(
    layoutedNodes,
    layoutedEdges,
    selectedNode,
  );

  // Create background sections for connected and isolated files
  const sectionNodes = createGraphSections(groups, layoutedNodes);

  // Combine background sections with highlighted file nodes
  const displayNodes = [...sectionNodes, ...highlightedNodes];

  return (
    // Main container for editor and dependency graph
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "750px",
        background: "#f8faff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Display source code editor when a file is selected */}
      {selectedFile && (
        <div
          style={{
            width: "40%",
            height: "100%",
            background: "#1e1e1e",
            overflow: "auto",
            borderRight: "2px solid #334155",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Display selected filename */}
          <div
            style={{
              padding: "16px",
              color: "#c084fc",
              fontSize: "14px",
              fontWeight: "600",
              borderBottom: "1px solid #374151",
              wordBreak: "break-all",
              flexShrink: 0,
            }}
          >
            📄 {selectedFile.path}
          </div>

          {/* Render source code with syntax highlighting and line numbers */}
          <SyntaxHighlighter
            language="jsx"
            style={vscDarkPlus}
            showLineNumbers={true}
            wrapLongLines={false}
            customStyle={{
              margin: 0,
              padding: "16px 10px",
              background: "#1e1e1e",
              fontSize: "13px",
              lineHeight: "1.7",
              textAlign: "left",
              minWidth: "max-content",
              flex: 1,
            }}
            lineNumberStyle={{
              color: "#858585",
              minWidth: "35px",
              paddingRight: "15px",
              textAlign: "right",
              userSelect: "none",
            }}
          >
            {selectedFile.content || ""}
          </SyntaxHighlighter>
        </div>
      )}

      {/* Right panel containing search and dependency graph */}
      <div
        style={{
          width: selectedFile ? "60%" : "100%",
          height: "100%",
          minWidth: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Show search only when repository is analyzed */}
        {nodes.length > 0 && (
          <GraphSearch nodes={nodes} onSelectNode={setSelectedNode} />
        )}

        {/* Keep the graph inside the remaining available panel space */}
        <div style={{ flex: 1, minHeight: 0 }}>
          {/* Provide React Flow context to the viewport component */}
          <ReactFlowProvider>
            <GraphViewport
              nodes={displayNodes}
              edges={highlightedEdges}
              nodeTypes={nodeTypes}
              selectedNode={selectedNode}
              onNodeClick={(_, node) => {
                if (node.type !== "section") {
                  setSelectedNode(node.id);
                }
              }}
              onPaneClick={() => setSelectedNode(null)}
            />
          </ReactFlowProvider>
        </div>

      </div>
    </div>
  );
}

export default DependencyGraph;
