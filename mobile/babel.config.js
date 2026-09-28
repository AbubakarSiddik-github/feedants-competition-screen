// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    // react-native-reanimated/plugin removed — not needed for Expo Go SDK 58
    // (worklets are handled internally by the SDK)
    plugins: [],
  };
};
