/* eslint-disable dot-notation, global-require */

const resolve = require("resolve");
const path = require("path");

const opts = (file, config) => Object.assign(
  {
    extensions: [".js", ".json"],
  },
  config,
  {
    basedir: path.dirname(path.resolve(file)),
    packageFilter: (pkg) => {
      const ret = Object.assign({}, pkg);

      if (pkg["jsnext:main"]) {
        ret["main"] = pkg["jsnext:main"];
      }

      return ret;
    },
  },
);

const isPathMatchesAlias = (p, alias) => {
  // Matching /^alias(\/|$)/
  if (p.indexOf(alias) === 0) {
    if (p.length === alias.length) return true;
    if (p[alias.length] === "/") return true;
  }

  return false;
};

exports.interfaceVersion = 2;
exports.resolve = (source, file, config) => {
  const relBase = (config && config.base) || path.join(__dirname, "../..");
  const baseDir = path.resolve(relBase);
  const packageDir = path.join(baseDir, "./package.json");
  const packageConfig = require(packageDir); // eslint-disable-line import/no-dynamic-require
  const aliases = packageConfig["_moduleAliases"];
  const aliasKeys = Object.keys(aliases);

  let m = source;
  try {
    for (const k of aliasKeys) {
      if (isPathMatchesAlias(source, k)) {
        const rel = source.substr(k.length);
        m = path.join(baseDir, aliases[k], rel);
      }
    }

    const p = resolve.sync(m, opts(file, config));
    return {
      found: true,
      path: p,
    };
  } catch (e) {
    return {
      found: false,
    };
  }
};
