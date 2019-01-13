import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
const builtins = require('rollup-plugin-node-builtins');

export const config: Config = {
  namespace: 'nimiqwidget',
  outputTargets:[
    { type: 'dist' },
    { type: 'docs' },
    {
      type: 'www',
      serviceWorker: null // disable service workers
    }
  ],
  plugins: [
    sass(),
    builtins()
  ]
};
