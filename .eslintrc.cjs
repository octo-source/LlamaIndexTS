const { join } = require("node:path");

module.exports = {
  root: true,
  extends: [
    "turbo",
    "prettier",
    "plugin:@typescript-eslint/recommended-type-checked-only",
  ],
  parserOptions: {
    project: join(__dirname, "tsconfig.eslint.json"),
    __tsconfigRootDir: __dirname,
  },
  settings: {
    react: {
      version: "999.999.999",
    },
  },
  rules: {
    "max-params": ["error", 4],
    "prefer-const": "error",
    "@typescript-eslint/no-floating-promises": [
      "error",
      {
        ignoreIIFE: true,
      },
    ],
    "no-debugger": "error",
    "@typescript-eslint/await-thenable": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/ban-types": "off",
    "no-array-constructor": "off",
    "@typescript-eslint/no-array-constructor": "off",
    "@typescript-eslint/no-base-to-string": [
      "error",
      {
        ignoredTypeNames: ["Error", "RegExp", "URL", "URLSearchParams"],
      },
    ],
    "@typescript-eslint/no-duplicate-enum-values": "off",
    "@typescript-eslint/no-duplicate-type-constituents": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-extra-non-null-assertion": "off",
    "@typescript-eslint/no-for-in-array": "off",
    "no-implied-eval": "off",
    "@typescript-eslint/no-implied-eval": "off",
    "no-loss-of-precision": "off",
    "@typescript-eslint/no-loss-of-precision": "off",
    "@typescript-eslint/no-misused-new": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
    "@typescript-eslint/no-redundant-type-constituents": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "@typescript-eslint/no-unnecessary-type-constraint": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-declaration-merging": "off",
    "@typescript-eslint/no-unsafe-enum-comparison": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "require-await": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/restrict-plus-operands": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/triple-slash-reference": "off",
    "@typescript-eslint/unbound-method": "off",
  },
  overrides: [
    {
      files: ["examples/**/*.ts"],
      rules: {
        "turbo/no-undeclared-env-vars": "off",
      },
    },
  ],
  ignorePatterns: ["dist/", "lib/", "deps/"],
};
