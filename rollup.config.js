import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import postcss from 'rollup-plugin-postcss';

import pkg from "./package.json";

export default {
  input: "src/index.js",
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [
    babel({
      exclude: "node_modules/**"
    }),
    resolve(),
    commonjs(),
    postcss({
      extract: true, // extract CSS to a separate file
      modules: true, // enable CSS modules
      minimize: true, // minify CSS
      // Additional PostCSS plugins or options can be added here
    }),
  ]
};
