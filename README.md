# ODM Proxy Server

This is a tiny proxy server to handle on demand load/unload of models from LM Studio or Lemonade server, 
LM Studio/Lemonade already loads a model on first request, but this allow to always have at most 1 model loaded (plus eventual allowList), which is the case for most multi model development setup.

## Flags

 --port, -p      : Port to serve on (default: 1234)
 
 --proxy, -x     : Port to proxy to (default: 12345)
 
 --allowlist, -a : Comma separated allowlist model names

 --lemon, -l     : Use lemonade API
 
 --help, -h      : This help screen.

## Getting Started
After installing the dependencies with your favourite package manager (in this example I'll use yarn)

`yarn i`

you can start the proxy with

`yarn start`.


## Notes
By default it expects LM Studio to be set up to listen to 12345 instead of the usual 1234 and will pretend to be LM Studio to your favourite IDE. I tested it with roo code extension for VS Code.

Lemonade support for allowlist is not implemented, it will just be ignored if passed.

My example setup in roo code: Orchestrator/Architect = devstral
Code mode = Qwen

### Prerequisites
- Node.js (tested with v18)
- yarn or any other package manager.

## Changelog
Added support for lemonade server after I discovered that I can't run lmstudio headless on Linux.

## License

MIT
