/*
 * Fuchur analyzes the status of git repositories with ease.
 *
 * Copyright(c) 2013 André König <andre.koenig@gmail.com>
 * MIT Licensed
 *
 */

require('colors');

var async       = require('async'),
    fs          = require('fs'),
    path        = require('path'),
    expandTilde = require('tilde-expansion');

module.exports = function (cli, config) {

    'use strict';

    var command = {},
        privates = {};

    Object.defineProperties(command, {
        'name': {
            enumerable: true,
            writable: false,
            value: 'init'
        },
        'description': {
            enumerable: true,
            writable: false,
            value: "Asks where 'fuchur' should search for your git repositories."
        },
        'author': {
            enumerable: true,
            writable: false,
            value: 'André König (andre.koenig@gmail.com)'
        },
        'pattern': {
            enumerable: true,
            writable: false,
            value: 'init'
        }
    });

    privates.footer = function () {
        console.log('\n  ✓'.green + ' Thanks! Saved it! Appreciate that.\n');
    };

    Object.defineProperty(command, 'exec', {
        enumerable: true,
        writable: false,
        value : function () {
            cli.prompt('\n  ✎ Path to my repositories: ', function (searchPath) {
                var tilde = false;

                // Is there a "tilde" in the path?
                // If so, expand the path value.
                tilde = (searchPath.charAt(0) === '~');

                async.series({
                    checkTilde : function (callMe) {
                        if (tilde) {
                            expandTilde(searchPath, function (expandedPath) {
                                searchPath = expandedPath;

                                callMe();
                            });
                        } else {
                            callMe();
                        }
                    },
                    normalize : function (callMe) {
                        // Normalize the path and add a trailing slash.
                        searchPath = path.normalize(searchPath) + path.sep;

                        callMe();
                    },
                    exists : function (callMe) {
                        var exists = fs.existsSync(searchPath);

                        callMe(exists);
                    }
                }, function (exists) {
                   if (exists) {
                       config.set('searchPath', searchPath, function () {
                           privates.footer();

                           process.exit();
                       });
                   } else {
                       console.log(("\n  ✖ Excuse me, this is not a valid place. Try again. \n").red);
                       command.exec();
                   } 
                });
            });
        }
    });

    return command;
};