/*
 * Fuchur analyzes the status of git repositories with ease.
 *
 * Copyright(c) 2013 André König <andre.koenig@gmail.com>
 * MIT Licensed
 *
 */

require('shelljs/global');
require('colors');

var fs         = require('fs'),
    repository = require('../utilities/repository')();

module.exports = function (cli, config) {

    'use strict';

    var command = {},
        privates = {};

    Object.defineProperties(command, {
        'name': {
            enumerable: true,
            writable: false,
            value: 'analyze'
        },
        'description': {
            enumerable: true,
            writable: false,
            value: 'Checks the status of all your git repositories and creates a detailed report afterwards.'
        },
        'author': {
            enumerable: true,
            writable: false,
            value: 'André König (andre.koenig@gmail.com)'
        },
        'pattern': {
            enumerable: true,
            writable: false,
            value: 'analyze'
        }
    });

    privates.footer = function (changes) {
        if (!changes) {
            console.log('  ✓'.green + ' Good! You did a great job. Nothing to do!\n');
        } else {
            console.log(("\n  ✖ Don't worry ...\n    Only " + changes + " issue(s). Fix them and your repositories will be up to date.\n").red);
        }
    };

    privates.check = function (path) {
        if (!which('git')) {
            echo('  ✖ Sorry, this command requires git \n'.red);

            exit(1);
        } else if (!fs.existsSync(path)) {
            echo('  ✖ Sorry, this path is not available \n'.red);

            exit(1);
        }
    };

    privates.hasRepository = function (path) {
        return fs.existsSync(privates.getRepository(path));
    };

    privates.getRepository = function (path) {
        return path + '/.git';
    };

    privates.printStatus = function (status) {
        var output = '',
            changes = false;

        if (status.changeset.added ||
            status.changeset.modified ||
            status.changeset.deleted ||
            status.changeset.unknown ||
            status.unpushed) {
            
            output = ('  ✖ ' + status.name.bold.underline).red + '\n\n';
            output = output + '    ☍ '.green + 'branch: ' + status.branch + '\n';
            output = output + '    + '.green + status.changeset.added + ' file(s) added \n';
            output = output + '    - '.green + status.changeset.deleted +' file(s) deleted \n';
            output = output + '    ✎ '.green + status.changeset.modified + ' file(s) modified \n';
            output = output + '    ? '.green + status.changeset.unknown + ' file(s) unknown / not staged \n';

            if (status.unpushed) {
                status.unpushed.forEach(function (unpushed) {
                    output = output + '    ☯'.green + ' unpushed commits for ' + unpushed.name + '/' + status.branch + '?' + ' YES\n'.green;
                });
            }

            changes = true;

            console.log(output);
        }

        return changes;
    };

    Object.defineProperty(command, 'exec', {
        enumerable: true,
        writable: false,
        value : function (path) {
            var changes = 0,
                status,
                path;

            path = config.get('searchPath');

            privates.check(path);

            // Check if the given path is one git repository
            if (privates.hasRepository(path)) {
                console.log(("\n  Let's go. Checking repo " + path + " ...\n").white.bold);

                status = repository.status(path);

                if (privates.printStatus(status)) {
                    changes = changes + 1;
                }

                privates.footer(changes);
            } else {
                console.log(("\n  Let's go. Checking all repos in " + path + " ...\n").white.bold);

                fs.readdir(path, function (err, directories) {
                    var directory,
                        directoryCount = directories.length,
                        i = 0,
                        workingDirectory;

                    for (i; i < directoryCount; i = i + 1) {
                        directory = directories[i];
                        workingDirectory = path + '/' + directory;

                        if (privates.hasRepository(workingDirectory)) {
                            status = repository.status(workingDirectory);

                            if (privates.printStatus(status)) {
                                changes = changes + 1;
                            }
                        }
                    }

                    privates.footer(changes);
                });
            }
        }
    });

    return command;
};