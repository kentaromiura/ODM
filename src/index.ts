// ODM Proxy Server - Proper Implementation
import http from "http";
import httpProxy from "http-proxy";
import getRawBody from "raw-body";
import { Readable } from "stream";

import { LMStudioClient, LLM } from "@lmstudio/sdk";
async function rawBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((ok, ko) => {
    getRawBody(req, {}, (err, str) => {
      if (err) {
        ko(err);
      }
      ok(str);
    });
  });
}

function unloadNonAllowedModels(models: LLM[], allowList: string[]) {
  models
    .filter((x) => !allowList.includes(x.identifier))
    .forEach((model) => {
      console.log("Unload model: ", model.identifier);
      model.unload();
    });
}

export async function createProxyLemon(
  sourcePort: number,
  targetPort: number,
): Promise<void> {
  const unload = async () =>
    await fetch(`http://127.0.0.1:${targetPort}/api/v1/unload`, {
      method: "POST",
    });
  const load = async (model) =>
    await fetch(`http://127.0.0.1:${targetPort}/api/v1/load`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Inform the server that the body is JSON
      },
      body: JSON.stringify({ model_name: model }), // Convert the data object to a JSON string
    });

  const modelLoaded = async () => {
    const res = await fetch(`http://127.0.0.1:${targetPort}/api/v1/health`, {
      method: "GET",
    });
    let r = await res.json();
    return r.model_loaded;
  };

  const proxy = httpProxy.createProxyServer({});
  var handler: http.RequestListener = async function (req, res) {
    let body = await rawBody(req);

    if (req.method === "POST" && req.url === "/v1/chat/completions") {
      let json = JSON.parse(body.toString("utf8"));
      let model = json.model;
      console.log("wanted model", model);
      let currentLoaded = await modelLoaded();
      console.log("loaded model", currentLoaded);
      console.log(json);
      if (currentLoaded !== model) {
        await unload();
        await load(model);
        let done = false;
        while (!done) {
          let loaded = await modelLoaded();
          done = loaded != null;
          console.log("loaded", loaded, done);
          await new Promise((ok) => setTimeout(ok, 300));
        }
      }
    }
    proxy.web(req, res, {
      target: `http://127.0.0.1:${targetPort}/api`,
      buffer: Readable.from(body),
    });
  };
  var server = http.createServer(handler);
  server.listen(sourcePort);
}
// Create the proxy server function
export async function createProxyServer(
  sourcePort: number,
  targetPort: number,
  allowList: string[],
): Promise<void> {
  const client = new LMStudioClient({
    baseUrl: `ws://127.0.0.1:${targetPort}`,
  });
  let initiallyLoadedModels = await client.llm.listLoaded();
  initiallyLoadedModels.forEach((model) => {
    model.unload();
  });
  const proxy = httpProxy.createProxyServer({});
  var handler: http.RequestListener = async function (req, res) {
    let body = await rawBody(req);
    if (req.method === "POST" && req.url === "/v1/chat/completions") {
      let json = JSON.parse(body.toString("utf8"));
      let model = json.model;
      let currentLoaded = await client.llm.listLoaded();
      unloadNonAllowedModels(currentLoaded, allowList.concat([model]));
      if (!currentLoaded.find((x) => x.identifier === model)) {
        await client.llm.load(model);
      }
      proxy.web(req, res, {
        target: `http://127.0.0.1:${targetPort}`,
        buffer: Readable.from(body),
      });
    }
  };
  var server = http.createServer(handler);
  server.listen(sourcePort);
}

// For direct execution - use default ports
if (require.main === module) {
  const sourcePort = parseInt(process.env.PORT || "1234");
  const targetPort = parseInt(process.env.PROXY_PORT || "12345");
  const allowList: string[] = [];
  createProxyServer(sourcePort, targetPort, allowList);
}
