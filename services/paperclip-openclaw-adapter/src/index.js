import http from "node:http";

const port = Number(process.env.ADAPTER_PORT || 3210);

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "paperclip-openclaw-adapter" }));
    return;
  }

  res.writeHead(501, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    ok: false,
    error: {
      code: "NOT_IMPLEMENTED",
      message: "Adapter scaffold only; contract implementation not yet completed."
    }
  }));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`paperclip-openclaw-adapter listening on ${port}`);
});
