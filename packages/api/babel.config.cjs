module.exports = {
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": {"version":  "3.24", "proposals":  true}
      }
    ]
  ],
  "plugins": [
    "transform-es2015-modules-commonjs",
    "babel-plugin-transform-import-meta"
  ]
}