import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.text({ limit: "50mb", type: ["text/plain", "application/json"] }));

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
    const isInline = req.query.inline === "1" || req.query.view === "1";
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", item.mimeType);
    res.setHeader("Content-Disposition", `${isInline ? "inline" : "attachment"}; filename="${item.filename}"`);
    res.setHeader("Content-Length", item.buffer.length);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(item.buffer);
  });

  const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwUIvbJKdfJopEH2E2V5Kf84gltgu-FQUEksdJQ_gbIQEJHmSPOkEcnEJboexKbCpf8FA/exec";

  // Cloud Sync Proxy: Handles GET from Google Apps Script without CORS/redirect issues
  app.get("/api/cloud-sync", async (req, res) => {
    try {
      const rawTargetUrl = (req.query.scriptUrl as string) || DEFAULT_SCRIPT_URL;
      const cleanUrl = rawTargetUrl.trim();
      const action = (req.query.action as string) || "get_all";

      const url = new URL(cleanUrl);
      url.searchParams.set("action", action);
      url.searchParams.set("_t", Date.now().toString());

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Accept": "application/json, text/plain, */*" }
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Apps Script status ${response.status}: ${response.statusText}` });
      }

      const text = await response.text();
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      try {
        const json = JSON.parse(text);
        return res.json(json);
      } catch {
        return res.send(text);
      }
    } catch (err: any) {
      console.warn("Cloud Sync GET proxy notice:", err?.message);
      return res.status(502).json({ error: err?.message || "Failed to contact Google Apps Script" });
    }
  });

  // Cloud Sync Proxy: Handles POST backup to Google Apps Script
  app.post("/api/cloud-sync", async (req, res) => {
    try {
      const rawTargetUrl = (req.query.scriptUrl as string) || DEFAULT_SCRIPT_URL;
      const cleanUrl = rawTargetUrl.trim();
      const bodyPayload = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

      const response = await fetch(cleanUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: bodyPayload,
      });

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return res.json(json);
      } catch {
        return res.json({ status: "success", raw: text.substring(0, 100) });
      }
    } catch (err: any) {
      console.warn("Cloud Sync POST proxy notice:", err?.message);
      return res.status(502).json({ error: err?.message || "Failed to post to Google Apps Script" });
    }
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
