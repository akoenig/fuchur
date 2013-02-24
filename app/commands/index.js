/*
 * Fuchur analyzes the status of git repositories with ease.
 *
 * Copyright(c) 2013 André König <andre.koenig@gmail.com>
 * MIT Licensed
 *
 */

var fs = require('fs'),
    path = require('path');

module.exports = function (cli, config) {
    'use strict';

    //
    // The command loader.
    //
    var COMMANDS_DIRECTORY = __dirname + '/',
        command,
        commandName,
        commandCount,
        commands = {},
        files,
        i = 0;

    files = fs.readdirSync(COMMANDS_DIRECTORY),
    commandCount = files.length;

    for (i; i < commandCount; i = i + 1) {
        command = files[i];

        if (path.basename(module.filename) !== command) {
            commandName = command.replace(path.extname(command), "");

            // TODO: Implement the dependency download from the commands package.json

            // e.g. command['init'] = require('./init.js');
            commands[commandName] = require(COMMANDS_DIRECTORY + commandName)(cli, config);
        }
    }

    return {
        getAll : function () {
            return commands;
        },
        get : function (name) {
            return commands[name];
        }
    };
};