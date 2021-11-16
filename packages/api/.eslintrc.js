module.exports = {
  "extends": [
    "eslint:recommended",
    "prettier"
  ],
  "env": {
    "es6": true,
    node: true
  },
  "parserOptions": {
    'ecmaVersion': 2019,
  },
  "parser": "@babel/eslint-parser",
  "rules": {
    "comma-dangle": ["error", "always-multiline"],
    "comma-spacing": ["error", { "before": false, "after": true }],
    "indent": ["error", 2, { "MemberExpression": 1 }],
    "max-len": ["error", {
      "code": 120
    }],
    "no-multiple-empty-lines": ["error"],
    "no-new-symbol": "error",
    "no-trailing-spaces": ["error"],
    "no-undef": ["error"],
    "no-unused-vars": ["error", { "argsIgnorePattern": "next" }],
    "object-curly-spacing": ["error", "always"],
    "object-shorthand": "error",
    "prefer-const": 2,
    "quotes": ["error", "single"],
    "space-in-parens": ["error", "never"],
    "strict": [2, "never"]
  }
}
