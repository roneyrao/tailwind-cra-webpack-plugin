# tailwind-cra-webpack-plugin
Tailwindcss v3 webpack plugin for CRA (Create React App) v3/v4

## Background
- Tailwindcss v3 doesn't support postcss v7, which is shipped in Create React App v3 and v4
- The official method to work with webpack also has issues
  + Duplicate buildings when HMR
  + It can not work properly with the cache plugin ([hard-source-webpack-plugin](https://www.npmjs.com/package/hard-source-webpack-plugin-fixed-hashbug))

## Usage
- install
```
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest tailwind-cra-webpack-plugin
# Add `postcss-import` if you needs `@import`
```

- apply
```diff
// craco.config.js as example

const { TailwindWebpackPlugin } = require('tailwind-cra-webpack-plugin')

module.exports = {
  webpack: {
    plugins: [
+     // The css entry point
+     new TailwindWebpackPlugin(require.resolve('../src/index.css')),
    ],
  },
- // These are not needed anymore
- postcss: {
-   plugins: [
-     require('tailwindcss'),
-     require('autoprefixer'),
-   ],
- },
}
```

## Notes
Only tested in CRA3 (nodejs v14), works in v4 theoretically.
