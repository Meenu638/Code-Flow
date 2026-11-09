const AdmZip = require("adm-zip");
const path = require("path");

async function downloadRepo(owner, repoName) {
  const url = `https://api.github.com/repos/${owner}/${repoName}/zipball`;

  const response = await fetch(url);

  // Identify GitHub ZIP download errors using HTTP status codes
  if (!response.ok) {
  const errorDetails = await response.text();

  console.error("GitHub Status:", response.status);
  console.error("GitHub Headers:", Object.fromEntries(response.headers));
  console.error("GitHub Error Details:", errorDetails);

  const error = new Error("Unable to download repository");
  error.status = response.status;

  throw error;
}

  const zipBuffer = Buffer.from(await response.arrayBuffer());

  return zipBuffer;
}

function extractRepo(zipBuffer) {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();

  return entries.map((entry) => ({
    path: entry.entryName,
    isDirectory: entry.isDirectory,
  }));
}

function readFileContent(zipBuffer, filePath) {
  const zip = new AdmZip(zipBuffer);
  const entry = zip.getEntry(filePath);

  if (!entry || entry.isDirectory) {
    return null;
  }

  return entry.getData().toString("utf8");
}

function filterSourceFiles(files) {
  const supportedExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".go",
  ];

  return files.filter((file) => {
    if (file.isDirectory) {
      return false;
    }

    return supportedExtensions.some((extension) =>
      file.path.endsWith(extension),
    );
  });
}

function extractImports(content) {
  const imports = [];

  const importRegex =
    /\bimport\s+(?:[\s\S]*?\s+from\s*)?["']([^"']+)["']|\bimport\s*["']([^"']+)["']/g;

  const requireRegex = /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g;

  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1] || match[2]);
  }

  while ((match = requireRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return [...new Set(imports)];
}

console.log("Testing extractImports...");

console.log(
  extractImports(`
    import Header from "./Header";
    const auth = require("../controllers/authController");
  `),
);

function resolveImport(importingFilePath, importPath, allFiles) {
  if (!importPath.startsWith(".")) {
    return null;
  }

  const directory = path.posix.dirname(importingFilePath);

  const basePath = path.posix.normalize(path.posix.join(directory, importPath));

  const extensions = [".js", ".jsx", ".ts", ".tsx"];

  const candidates = [
    basePath,
    ...extensions.map((ext) => basePath + ext),
    ...extensions.map((ext) => path.posix.join(basePath, "index" + ext)),
  ];

  return (
    candidates.find((candidate) =>
      allFiles.some((file) => file.path === candidate),
    ) || null
  );
}

module.exports = {
  downloadRepo,
  extractRepo,
  readFileContent,
  filterSourceFiles,
  extractImports,
  resolveImport,
};
