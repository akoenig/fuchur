#!/usr/bin/env node

/*
 * Fuchur analyzes the status of git repositories with ease.
 *
 * Copyright(c) 2013 André König <andre.koenig@gmail.com>
 * MIT Licensed
 *
 */

'use strict';

var fuchur = require('./app')(),
    Solar  = require('solar');

module.exports = function () {
    var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/',
        config = new Solar(home + '.fuchur');

    config.on('loaded', function () {
        fuchur.fly(config);
    });
};