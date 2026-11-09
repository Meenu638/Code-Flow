function RepositoryStats({ repoTree = [], nodes = [], edges = [] }) {

  // Calculate total files and folders from GitHub repository tree
  const totalFiles = repoTree.filter(
    (item) => item.type === "blob"
  ).length;

  const totalFolders = repoTree.filter(
    (item) => item.type === "tree"
  ).length;

  // Calculate total dependencies between repository files
  const totalDependencies = edges.length;

  // Identify files that participate in at least one dependency
  const connectedNodeIds = new Set();

  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  // Calculate connected and isolated files
  const connectedFiles = connectedNodeIds.size;

  const isolatedFiles = nodes.filter(
    (node) => !connectedNodeIds.has(node.id)
  ).length;

  // Store all calculated statistics for rendering
  const stats = [
    { title: "Total Files", value: totalFiles, icon: "📄" },
    { title: "Total Folders", value: totalFolders, icon: "📁" },
    { title: "Dependencies", value: totalDependencies, icon: "🔗" },
    { title: "Connected Files", value: connectedFiles, icon: "🧩" },
    { title: "Isolated Files", value: isolatedFiles, icon: "⚪" },
  ];

  return (
    // Display repository statistics in responsive Bootstrap cards
    <div className="row g-3 mt-3 mb-4">
      {stats.map((stat) => (
        <div className="col-6 col-md-4 col-lg" key={stat.title}>
          <div className="card h-100 shadow-sm text-center p-3">
            <h3>{stat.icon}</h3>
            <h4 className="fw-bold">{stat.value}</h4>
            <p className="mb-0 text-muted">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RepositoryStats;