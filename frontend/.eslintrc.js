module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    "plugin:react/recommended",
    "airbnb",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
    project: "./tsconfig.json"
  },
  settings: {
    "import/resolver": {
      "typescript": {},
      "node": { extensions: [".ts", ".tsx"],}
    },
  },
  plugins: [
    "react",
    "@typescript-eslint",
  ],
  root: true,
  rules: {
    "react/jsx-filename-extension": [1, { extensions: [".jsx", ".tsx"] }],
    "import/extensions": [
      "error",
      "ignorePackages",
      { ts: "never", tsx: "never", },
    ],
    "max-len": ["error", 130], "react/jsx-indent": ["error", 2], "quotes": ["error", "double"],
    "spaced-comment": "off", "object-curly-newline": "off", "object-property-newline": "off",
    "indent": "off", "react/jsx-wrap-multilines": "off", "react/jsx-closing-tag-location": "off",
  },
};
