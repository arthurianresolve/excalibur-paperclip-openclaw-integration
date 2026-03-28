import http from "http";
import { createTransport } from "./transport";
import { config } from "./config";

const app = createTransport();
const server = http.createServer(app);

server.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Paperclip ↔ OpenClaw adapter listening on port ${config.port}`);
});

process.on("SIGINT", () => {
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log("Adapter shutting down");
    process.exit(0);
  });
});
