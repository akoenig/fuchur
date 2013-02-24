/*
 * Fuchur analyzes the status of git repositories with ease.
 *
 * Copyright(c) 2013 André König <andre.koenig@gmail.com>
 * MIT Licensed
 *
 */

var cli      = require('commander'),
    commands = require('./commands'),
    packagejson = require('../package.json');

module.exports = function () {
    'use strict';

    var privates = {};

    cli.version(packagejson.version);

    // Helper method which binds the given command
    // to the command line interface in a DSL fashion.
    privates.bind = function (command) {
        return {
            toCLI : function () {
                cli
                    .command(command.pattern)
                    .description(command.description)
                    .action(command.exec);
            }
        };
    };

    return {
        fly : function (config) {
            var args,
                command;
            
            commands = commands(cli, config).getAll();

            // Binding all available commands to the
            // command line user interface.
            for (command in commands) {
                if (commands.hasOwnProperty(command)) {
                    command = commands[command];

                    privates.bind(command).toCLI();
                }
            }

            if (!config.get('searchPath')) {
                console.log("  ✖ Where are your repos? Don't know where to search. Do you want to tell me?\n".red);

                commands.init.exec();
            } else {
                args = cli.parse(process.argv).rawArgs;

                // Execute the default command, which is 'analyze',
                // if the user has not defined one.
                if (!args[2]) {
                    commands.analyze.exec();
                }
            }
        }
    };
};