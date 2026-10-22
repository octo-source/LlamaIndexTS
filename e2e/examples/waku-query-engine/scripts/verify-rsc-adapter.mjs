import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const { rscRsdwPlugin } = await import(
  new URL("./lib/plugins/vite-plugin-rsc-rsdw.js", import.meta.resolve("waku"))
);
const rendererDir = dirname(
  require.resolve("react-server-dom-webpack/client.node"),
);

// Patched React can select the Node client entry during Waku SSR. Exercise the
// installed renderer source, not a mock of the adapter's expected input.
for (const mode of ["production", "development"]) {
  const file = join(
    rendererDir,
    "cjs",
    `react-server-dom-webpack-client.node.${mode}.js`,
  );
  const source = await readFile(file, "utf8");
  const plugin = rscRsdwPlugin();
  const transformed = plugin.transform(source, file);
  assert.equal(typeof transformed, "string");
  assert.ok(transformed.includes("__WAKU_CLIENT_REQUIRE__"));
  assert.ok(!/__webpack_\w+__/.test(transformed));

  // Unknown adapter input must still fail closed instead of silently shipping
  // an untransformed webpack loader in the Vite bundle.
  assert.throws(
    () => plugin.transform(source, "/unrecognized-renderer.js"),
    /Untransformed file/,
  );
}

console.log(
  "Waku adapts installed React Node clients and rejects unknown inputs",
);
