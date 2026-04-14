const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow .lottie files to be bundled as assets
config.resolver.assetExts.push('lottie');

module.exports = config;
