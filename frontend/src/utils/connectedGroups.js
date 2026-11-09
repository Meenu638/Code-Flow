// Find all connected components in the dependency graph
export const getConnectedGroups = (nodes, edges) => {
  const adjacencyList = new Map();

  // Har file ke liye empty connection list
  nodes.forEach((node) => {
    adjacencyList.set(node.id, []);
  });

  // Files ke beech connections add karo
  edges.forEach((edge) => {
    if (adjacencyList.has(edge.source) && adjacencyList.has(edge.target)) {
      adjacencyList.get(edge.source).push(edge.target);
      adjacencyList.get(edge.target).push(edge.source);
    }
  });

  const visited = new Set();
  const groups = [];

  // Har file se connected group search karo
  nodes.forEach((node) => {
    if (visited.has(node.id)) return;

    const group = [];
    const stack = [node.id];

    visited.add(node.id);

    while (stack.length > 0) {
      const current = stack.pop();

      group.push(current);

      adjacencyList.get(current).forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      });
    }

    groups.push(group);
  });

  return groups;
};