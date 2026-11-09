const { buildGraph } = require("./graphBuilder");
const express = require("express");
const cors = require("cors");
const {
  downloadRepo,
  extractRepo,
  readFileContent,
  filterSourceFiles,
  extractImports,
  resolveImport,
} = require("./githubAnalyzer");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.listen(PORT, "0.0.0.0", () => {
  console.log(`App is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Backend is running in PORT 5000");
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { owner, repoName } = req.body;

    if (!owner || !repoName) {
      return res.status(400).json({
        error: "Owner and repository name are required",
      });
    }

    console.log("STEP 1: Starting download");

    const zipBuffer = await downloadRepo(owner, repoName);

    console.log("STEP 2: Download completed");

    const files = extractRepo(zipBuffer);
    console.log("STEP 3: ZIP extracted", files.length);

    const sourceFiles = filterSourceFiles(files);
    console.log("STEP 4: Source files filtered", sourceFiles.length);

    const filesToRead = sourceFiles.filter((file) =>
      file.path.includes("/src/"),
    );

    const limitedFiles = filesToRead.slice(0, 100);
    console.log("STEP 5: Files selected for reading", filesToRead.length);

    const analyzedFiles = limitedFiles.map((file) => ({
      path: file.path,
      content: readFileContent(zipBuffer, file.path),
    }));

    const filesWithImports = analyzedFiles.map((file) => {
      const imports = extractImports(file.content || "");

      console.log("STEP 6: Imports and dependencies processed");

      return {
        path: file.path,
        imports: imports,
        dependencies: imports
          .map((importPath) =>
            resolveImport(file.path, importPath, sourceFiles),
          )
          .filter((resolvedPath) => resolvedPath !== null),
      };
    });

    console.log("========== DEPENDENCY REPORT ==========");

    filesWithImports.forEach((file) => {
      console.log("File:", file.path);
      console.log("Imports:", file.imports);
      console.log("Resolved Dependencies:", file.dependencies);
      console.log("--------------------------------");
    });

    console.log("Total analyzed files:", filesWithImports.length);

    console.log(
      "Files with dependencies:",
      filesWithImports.filter((file) => file.dependencies.length > 0).length,
    );

    console.log(
      "Files without dependencies:",
      filesWithImports.filter((file) => file.dependencies.length === 0).length,
    );

    console.log("=======================================");

    const { nodes, edges } = buildGraph(filesWithImports);

    res.json({
      message: "Repository downloaded successfully",
      owner,
      repoName,
      totalEntries: files.length,
      totalSourceFiles: sourceFiles.length,
      sourceFiles,
      analyzedFiles,
      filesWithImports,
      nodes,
      edges,
    });
  } catch (error) {
    console.error("Repository analysis error:", error);

    res.status(error.status || 500).json({
      error: error.message || "Unable to analyze repository",
    });
  }
});
