import "./FileTrees.css";
import { useState } from "react";

function buildTree(files) {
  const root = {};

  files.forEach((file) => {
    const parts = file.path.split("/");
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          children: {},
          isFile: index === parts.length - 1 && file.type === "blob",
        };
      }

      current = current[part].children;
    });
  });

  return root;
}

function TreeNode({ name, node }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <li>
      <span
        onClick={() => {
          if (!node.isFile) {
            setIsOpen(!isOpen);
          }
        }}
        style={{
          cursor: node.isFile ? "default" : "pointer",
          display: "inline-block",
          padding: "4px 0",
        }}
      >
        {node.isFile ? "📄" : isOpen ? "📂" : "📁"} {name}
      </span>

      {isOpen && Object.entries(node.children).length > 0 && (
        <ul>
          {Object.entries(node.children).map(([childName, childNode]) => (
            <TreeNode key={childName} name={childName} node={childNode} />
          ))}
        </ul>
      )}
    </li>
  );
}

function FileTree({ files }) {
  const tree = buildTree(files);

  return (
    <div className="file-tree">
      {" "}
      <h4>Repository Files</h4>
      <ul>
        {Object.entries(tree).map(([name, node]) => (
          <TreeNode key={name} name={name} node={node} />
        ))}
      </ul>
    </div>
  );
}

export default FileTree;
