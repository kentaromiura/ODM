// Simple CLI using clint to parse parameters
import { clint } from "clint";

// Create CLI instance and set up parameters with default values
const cli = clint();

let portValue = 1234;
let proxyValue = 12345;
let allowList: string[] = [];
let showHelp = false;
let lemon = false;
// Set up port parameter (default 1234)
cli.command("--port", "-p", "Port to serve on (default: 1234)");

// Set up proxy parameter (default 12345)
cli.command("--proxy", "-x", "Port to proxy to (default: 12345)");

// Whitelist some models.
cli.command("--allowlist", "-a", "Comma separated allowlist model names");

cli.command("--help", "-h", "This help screen.");
cli.command("--lemon", "-l", "Use lemonade API");
// Handle command line arguments
cli.on("command", function (name: string, value: string) {
  switch (name) {
    case "--lemon":
      lemon = true;
      break;
    case "--help":
      showHelp = true;
      break;
    case "--port":
      portValue = parseInt(value);
      break;
    case "--proxy":
      proxyValue = parseInt(value);
      break;
    case "--allowlist":
      allowList = value.split(",");
      break;
  }
});

// Show configuration and exit
cli.on("complete", function () {
  if (showHelp) {
    console.log(cli.help());
    return 0;
  }
  console.log("Configuration:");
  console.log("- Serving on port:", portValue);
  console.log("- Proxying to port:", proxyValue);
  console.log("- Allow list:", allowList);
  console.log(lemon ? "Using lemonade API" : "");

  // Import and start the server with these parameters
  import("./index.js")
    .then(async (module) => {
      const { createProxyServer, createProxyLemon } = module;

      console.log(
        "Starting " +
          (lemon ? "lemon " : "") +
          "proxy server with parameters...",
      );
      await (lemon ? createProxyLemon : createProxyServer)(
        portValue,
        proxyValue,
        allowList,
      );
    })
    .catch((err) => {
      console.error("Failed to start server:", err);
    });
});

// Parse the command line arguments
cli.go();
