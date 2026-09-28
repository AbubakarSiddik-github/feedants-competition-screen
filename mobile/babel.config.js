// babel.config.js — NativeWind v4 + Expo SDK 57
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      // react-native-reanimated/plugin must be last
      "react-native-reanimated/plugin",
    ],
  };
};
