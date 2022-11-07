import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
const {babel} = require('@rollup/plugin-babel');
const babelOptions = {
    'presets': ['@babel/preset-react']
};
const replace = require('@rollup/plugin-replace');
export default {
    input: 'server.js',
    output: {
        file: 'bundle.mjs',
        format: 'esm'
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        json(),
        babel(babelOptions),
        replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.NODE_DEBUG': JSON.stringify(''),
    })]
}