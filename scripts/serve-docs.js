import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.resolve(__dirname, "..", "docs");
const startPort = Number.parseInt(process.env.PORT || "4173", 10);

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"]
]);

function filePathForUrl(url) {
  const parsedUrl = new URL(url, "http://localhost");
  const pathname = decodeURIComponent(parsedUrl.pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const resolvedPath = path.resolve(docsDir, relativePath);

  if (!resolvedPath.startsWith(docsDir)) {
    return null;
  }

  return resolvedPath;
}

function createServer() {
  return http.createServer((request, response) => {
    const filePath = filePathForUrl(request.url || "/");

    if (!filePath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      const contentType = mimeTypes.get(path.extname(filePath)) || "application/octet-stream";
      response.writeHead(200, { "Content-Type": contentType });
      response.end(content);
    });
  });
}

function listen(port) {
  const server = createServer();

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      listen(port + 1);
      return;
    }
    throw error;
  });

  server.listen(port, () => {
    console.log(`Docs server running at http://localhost:${port}`);
  });
}

listen(startPort);
