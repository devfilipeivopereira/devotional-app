const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@supabase/functions-js" || moduleName.startsWith("@supabase/functions-js/")) {
    return {
      filePath: path.resolve(__dirname, "lib/supabase-functions-stub.js"),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
