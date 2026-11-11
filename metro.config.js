// Configuração do Metro para o expo-sqlite funcionar também na versão web.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// O SQLite na web roda via WebAssembly (.wasm)
config.resolver.assetExts.push('wasm');

// Headers necessários para o SharedArrayBuffer usado pelo SQLite na web
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  middleware(req, res, next);
};

module.exports = config;
