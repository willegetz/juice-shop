'use strict';

let config = {
    cwd: __dirname ,
    modulePaths: [
        './',
        './lib/'
    ],
    allowOverride: false,
    eagerLoad: false,
    errorOnModuleDNE: true
};

module.exports = require('dject').new(config);