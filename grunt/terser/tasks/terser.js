var Terser = require('terser');
var path = require('path');
var util = require('util');
var CleanCSS = require('clean-css');
var chalk = require('chalk');
var maxmin = require('maxmin');
/**
 * Custom Terser task.
 * Used to minify ES6+ files.
 */
module.exports = function (grunt) {


    grunt.registerMultiTask(
        'terser',
        'Task to run Terser to minify JS files.',
        function () {
            // Force task into async mode and grab a handle to the "done" function.
            var done = this.async();
            var options = {
                sourceMap: true
            };
            this.files.forEach(function (file) {
              //  grunt.log.writeln(file.src);
              //  grunt.log.writeln(file.dest);

                // Check if file actually exists (it always should).
                if (!grunt.file.exists(file.src[0])) {
                    grunt.log.warn('Source file "' + file.src[0] + '" not found.');
                    return false;
                } else {
                    let filesrc = grunt.file.read(file.src);
                    Terser.minify(filesrc, options).then(result => {
                        grunt.log.writeln(result.code);
                        grunt.log.writeln(result.map);
                    }).catch(error => {
                        grunt.log.writeln(error);
                    });
                }
            }, this);




        });

};