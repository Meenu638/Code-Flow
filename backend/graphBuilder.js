function buildGraph(filesWithImports) {
  const nodes = filesWithImports.map((file) => ({
    id: file.path,
    label: file.path.split("/").pop(),
  }));

  const edges = filesWithImports.flatMap((file) =>
    file.dependencies.map((dependency) => ({
      source: file.path,
      target: dependency,
    }))
  );

  return { nodes, edges };
}

module.exports = { buildGraph };