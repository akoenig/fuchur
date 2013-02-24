/*
 * Fuchur analyzes the status of git repositories with ease.
 *
 * Copyright(c) 2013 André König <andre.koenig@gmail.com>
 * MIT Licensed
 *
 */

var cli      = require('commander'),
    commands = require('./commands');

module.exports = function () {
    'use strict';

    var privates = {};

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
            var command;
            
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

                commands['init'].exec();
            } else {
                cli.parse(process.argv);
            }
        }
    };
};