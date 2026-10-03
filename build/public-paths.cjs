module.exports = (options = {}) => ({
  postcssPlugin: "myu-public-paths",
  Declaration(declaration) {
    const base = (options.basePath || "").replace(/\/$/, "");
    if (!base || !declaration.value.includes("url(")) return;
    declaration.value = declaration.value.replace(
      /url\((["']?)\/(images|documents|audio)\//g,
      (_, quote, folder) => `url(${quote}${base}/${folder}/`,
    );
  },
});
module.exports.postcss = true;
