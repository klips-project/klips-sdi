const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = {
  trailingSlash: true,
  transformer: {
    getTransformOptions: async () => ({
      transform: {
      },
    }),
  },
  resolver: {
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs'],
  },
};

config.resolver.sourceExts.push('mjs');

module.exports = config;