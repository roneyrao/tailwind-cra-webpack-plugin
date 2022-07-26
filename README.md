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
```

- apply
```diff
// craco.config.js as example

const { TailwindWebpackPlugin } = require('tailwind-cra-webpack-plugin')

module.exports = {
  webpack: {
    plugins: [
+     // The css file that contains `@tailwind utilities` (We assume only one file contains it).
+     // It will be recompiled each time when any js file is changed
+     // which are defined in the `content` field in `tailwind.config.js`,
+     // to reflect any new user defined classes.
+     new TailwindWebpackPlugin(require.resolve('../src/index.css')),
    ],
  },
  postcss: {
    plugins: [
      // These are not needed anymore
-     require('tailwindcss'),
-     require('autoprefixer'),
    ],
  },
}
```

## Notes
Only tested in CRA3 (nodejs v14), works in v4 theoretically.
