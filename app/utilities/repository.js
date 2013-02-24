/*
 * Fuchur analyzes the status of git repositories with ease.
 *
 * Copyright(c) 2013 André König <andre.koenig@gmail.com>
 * MIT Licensed
 *
 */

 /*global cd:true, exec:true */

var path = require('path');

module.exports = function () {

    'use strict';

    var privates = {},
        repository,
        execOptions = {
            silent: true
        };

    privates.determineName = function () {
        return path.basename(repository);
    };

    privates.determineBranch = function () {
        var output = exec('git branch', execOptions).output;

        return output.match(/[*]{1}\s(\w+)/i)[1];
    };

    privates.determineUnpusheds = function (branch) {
        var remotes = exec('git remote', execOptions).output.split('\n') || [],
            entries = [],
            has = false;

        remotes.forEach(function (remote) {
            var entry;

            if (remote) {
                entry = {
                    name: remote,
                    is: (exec('git log '+ remote + '/' + branch + '..HEAD', execOptions).output.length > 0)
                };

                entries.push(entry);

                has = (entry.is);
            }
        });

        return (has) ? entries : false;
    };

    privates.determineChangeset = function () {
        var output = exec('git status . --porcelain', execOptions).output,
            changeset = {
                added: 0,
                deleted: 0,
                modified: 0,
                unknown: 0
            },
            results = output.match(/(A|D|M|\?{1,2}){1,2}/g) || {length: 0},
            resultsCount = results.length,
            charCount = 0,
            i = 0,
            j = 0;

            for (i; i < resultsCount; i = i + 1) {
                if (results[i] === '??') {
                    changeset.unknown = changeset.unknown + 1;
                } else {
                    charCount = results[i].length;

                    for (j = 0; j < charCount; j = j + 1) {
                        switch (results[i][j]) {
                            case 'A':
                                changeset.added = changeset.added + 1;
                            break;
                            case 'D':
                                changeset.deleted = changeset.deleted + 1;
                            break;
                            case 'M':
                                changeset.modified = changeset.modified + 1;
                            break;
                        }
                    }
                }
            }

            return changeset;
    };

    return {
        status : function (workingDirectory) {
            var meta = {};

            repository = workingDirectory;

            cd(repository);

            meta.name = privates.determineName();
            meta.branch = privates.determineBranch();
            meta.unpushed = privates.determineUnpusheds(meta.branch);
            meta.changeset = privates.determineChangeset();

            return meta;
        }
    };
};