import { createSectionNode } from "../SectionNode";

// Create background sections for connected components and isolated files
export function createGraphSections(groups, layoutedNodes) {

  // Create separate sections for connected components
  const connectedSectionNodes = groups
    .filter((group) => group.length > 1)
    .map((group, index) => {

      // Find all nodes belonging to the current component
      const groupNodes = layoutedNodes.filter((node) =>
        group.includes(node.id),
      );

      return createSectionNode(
        `connected-section-${index}`,
        `Connected Component ${index + 1}`,
        groupNodes,
        "#eef2ff",
      );
    });

  // Collect all files that have no dependencies
  const isolatedNodes = layoutedNodes.filter((node) =>
    groups.some((group) => group.length === 1 && group[0] === node.id),
  );

  // Create background section for isolated files
  const sectionNodes = [
    ...connectedSectionNodes,
    createSectionNode(
      "isolated-section",
      "Isolated Files",
      isolatedNodes,
      "#f0fdf4",
    ),
  ].filter(Boolean);

  return sectionNodes;
}