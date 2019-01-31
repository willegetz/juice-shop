'use strict';

const signet = require('signet')();

signet.defineDuckType('maybeDate', {
    date: '[object]'
});

module.exports = signet;