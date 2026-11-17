// A tiny static server for the repo root, inside the test process (the
// browser tests load the app from it): import { serveRepo } and await it.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".webmanifest": "application/manifest+json" };
export function serveRepo(port = 8765) {
  const server = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (p !== root && !p.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    fs.readFile(p, (err, buf) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" });
      res.end(buf);
    });
  });
  return new Promise((ok, fail) => { server.once("error", fail); server.listen(port, "127.0.0.1", () => ok(server)); });
}
