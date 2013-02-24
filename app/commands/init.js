/*
 * Fuchur analyzes the status of git repositories with ease.
 *
 * Copyright(c) 2013 André König <andre.koenig@gmail.com>
 * MIT Licensed
 *
 */

require('colors');

var fs = require('fs');

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
            cli.prompt('\n  ✎ Path to my repositories: ', function (path) {
                if (fs.existsSync(path)) {
                    path = path + ((path.charAt(path.length - 1) !== "/") ? '/' : '');

                    config.set('searchPath', path, function () {
                        privates.footer();

                        process.exit();
                    });
                } else {
                    console.log(("\n  ✖ Excuse me, this is not a valid place. Try again. \n").red);
                    command.exec();
                }
            });
        }
    });

    return command;
};