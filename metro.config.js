const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    blockList: [
      /.*[/\\]backend[/\\].*/,
      /.*[/\\]app[/\\].*/,
      /.*[/\\]android[/\\].*/,
      /.*[/\\]ios[/\\].*/,
      /.*[/\\]node_modules[/\\]react-native-reanimated[/\\]android[/\\].*/
    ]
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
