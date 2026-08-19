const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const distRoot = path.join(root, "dist");
const port = Number(process.env.PORT || 8000);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream"
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/health" || url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "e-circular-backend" });
    return;
  }

  if (url.pathname === "/api/config") {
    sendJson(res, 200, {
      appName: "E-Circular System",
      frontend: "React",
      backend: "Node"
    });
    return;
  }

  const requested = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(distRoot, requested === "/" ? "index.html" : requested);

  if (!filePath.startsWith(distRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distRoot, "index.html");
  }

  if (!fs.existsSync(filePath)) {
    sendJson(res, 404, {
      error: "React build not found",
      hint: "Run npm install, then npm run build before npm start."
    });
    return;
  }

  serveFile(res, filePath);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`E-Circular React + Node app running at http://127.0.0.1:${port}`);
});
