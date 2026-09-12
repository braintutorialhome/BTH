import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API health checks for deployment and container probes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Staging for generated documents (PDF / CSV) to enable Android APK WebViews to download via standard HTTPS
  const stagedFiles = new Map<string, { buffer: Buffer; filename: string; mimeType: string; timestamp: number }>();

  // Cleanup expired files every 2 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [id, item] of stagedFiles.entries()) {
      if (now - item.timestamp > 15 * 60 * 1000) {
        stagedFiles.delete(id);
      }
    }
  }, 2 * 60 * 1000);

  app.post("/api/export/stage-file", (req, res) => {
    try {
      const { base64Data, filename, mimeType } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "Missing base64Data" });
      }
      const id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      const safeFilename = (filename || "document.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
      const safeMime = mimeType || "application/pdf";
      const buffer = Buffer.from(base64Data, "base64");
      stagedFiles.set(id, { buffer, filename: safeFilename, mimeType: safeMime, timestamp: Date.now() });
      const downloadUrl = `/api/export/download-file?id=${id}&filename=${encodeURIComponent(safeFilename)}`;
      res.json({ success: true, id, downloadUrl });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "Failed to stage file" });
    }
  });

  app.get("/api/export/download-file", (req, res) => {
    const id = req.query.id as string;
    const item = id ? stagedFiles.get(id) : null;
    if (!item) {
      return res.status(404).send("This download link has expired. Please return to the app and generate the document again.");
    }
    res.setHeader("Content-Type", item.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${item.filename}"`);
    res.setHeader("Content-Length", item.buffer.length);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(item.buffer);
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
