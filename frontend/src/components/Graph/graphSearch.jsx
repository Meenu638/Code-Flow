import { useState } from "react";

function GraphSearch({ nodes = [], onSelectNode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Find files matching the search query
  const filteredNodes = nodes.filter((node) =>
    node.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      style={{
        width: "100%",
        padding: "12px 16px",
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Search input for repository files */}
      <input
        type="text"
        placeholder="🔍 Search files..."
        value={searchTerm}
        onChange={(e) =>{
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        style={{
          width: "100%",
          padding: "11px 14px",
          border: "1px solid #c7d2fe",
          borderRadius: "9px",
          outline: "none",
          background: "#f8faff",
          fontSize: "14px",
          boxSizing: "border-box",
        }}
      />

      {/* Display matching file suggestions */}
      {searchTerm && showSuggestions && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% - 5px)",
            left: "16px",
            right: "16px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "9px",
            maxHeight: "220px",
            overflowY: "auto",
            boxShadow: "0 5px 15px rgba(0,0,0,0.12)",
            zIndex: 20,
          }}
        >
          {filteredNodes.length > 0 ? (
            filteredNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => {
                  onSelectNode(node.id);
                  setSearchTerm(node.label);
                  setShowSuggestions(false);
                }}
                style={{
                  padding: "11px 14px",
                  cursor: "pointer",
                  fontSize: "13px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                📄 {node.label}
              </div>
            ))
          ) : (
            <div style={{ padding: "12px", color: "#64748b" }}>
              No matching files found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GraphSearch;