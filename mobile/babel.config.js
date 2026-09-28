// babel.config.js — required for NativeWind v4
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: ["react-native-reanimated/plugin"],
  };
};
