import "./Hero.css";
import { useState } from "react";
import FileTree from "./FileTrees";
import { getRepoDetails, getRepoTree } from "../services/githubService";
import DependencyGraph from "./DependencyGraph";
import RepositoryStats from "./RepositoryStats";

function Hero() {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoInfo, setRepoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [repoTree, setRepoTree] = useState([]);
  const [graphData, setGraphData] = useState({
    nodes: [],
    edges: [],
  });
  const [analyzedFiles, setAnalyzedFiles] = useState([]);

  const handleAnalyze = async () => {
    setError("");
    setRepoInfo(null);
    if (!repoUrl.trim()) {
      setError("Please paste your GitHub repository URL");
      return;
    }

    try {
      const url = new URL(repoUrl.trim());

      if (
        url.hostname !== "github.com" ||
        !/^\/[^/]+\/[^/]+\/?$/.test(url.pathname)
      ) {
        setError("Please enter a valid GitHub repository URL");
        return;
      }

      const pathParts = url.pathname.split("/").filter(Boolean);

      const owner = pathParts[0];
      const repoName = pathParts[1];

      setLoading(true);

      const details = await getRepoDetails(owner, repoName);

      const tree = await getRepoTree(owner, repoName, details.defaultBranch);

      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner,
          repoName,
        }),
      });


      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Repository analysis failed");
      }

      setAnalyzedFiles(data.analyzedFiles || []);

      setGraphData({
        nodes: data.nodes || [],
        edges: data.edges || [],
      });

      setRepoInfo(details);
      setRepoTree(tree);

      console.log("Repository Tree:", tree);

      console.log("Repository Data:", details);
    } catch (error) {
      console.error("API Error:", error);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="hero container">
      <div className="text-center">
        <h1>Understand Any Codebase</h1>
        <p>Visualize your project's structure, dependencies, and code flow.</p>
        <div className="input-group mt-4 mx-auto hero-input">
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="form-control w-100"
            placeholder="Paste your GitHub repository URL..."
          />

          <button
            onClick={handleAnalyze}
            className="btn btn-primary analyze-btn"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Code"}
          </button>
        </div>

        {repoInfo && (
          <div className="card mt-4 mx-auto p-4" style={{ maxWidth: "500px" }}>
            <h4>Repository Details</h4>

            <p>
              <strong>Owner:</strong> {repoInfo.owner}
            </p>

            <p>
              <strong>Repository Name:</strong> {repoInfo.repoName}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {repoInfo.description || "No description available"}
            </p>

            <p>
              <strong>Language Used:</strong>{" "}
              {repoInfo.language || "Not specified"}
            </p>

            <p>
              <strong>GitHub Stars:</strong> {repoInfo.stars} ⭐
            </p>

            <a
              href={`https://github.com/${repoInfo.owner}/${repoInfo.repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark mt-2 github-btn"
            >
              View on GitHub
            </a>
          </div>
        )}

        {repoTree.length > 0 && <FileTree files={repoTree} />}
        {graphData.nodes.length > 0 && (
          <div className="container mt-4">
            {repoInfo && (
              <RepositoryStats
                repoTree={repoTree}
                nodes={graphData.nodes}
                edges={graphData.edges}
              />
            )}
            <h3
              className="text-center"
              style={{ paddingTop: "55px", marginTop: "20px" }}
            >
              Repository Dependency Graph
            </h3>

            <DependencyGraph
              nodes={graphData.nodes}
              edges={graphData.edges}
              analyzedFiles={analyzedFiles}
            />
          </div>
        )}

        {error && (
          <p className="text-danger mt-3" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

export default Hero;
