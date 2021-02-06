const path = require('path');
let done;

/**
 * Custom Terser task.
 * Used to minify ES6+ files.
 */
module.exports = function (grunt) {
    grunt.registerMultiTask(
        'cachebust',
        'Task to create cache busting js files.',
        function () {
            done = this.async();  // Force task into async mode and grab a handle to the "done" function.
            let options = this.options();
            let JSONmap = {};
            let fileRegex = new RegExp('\\.[a-f0-9]{12}\\.js');
            let importRegex = new RegExp('\\}\\s*from\\s*[\"\'](.*?)[\"\']\\s*\;', 'g');

            // Before we do anything, we want to check that the JSON mapping file exists.
            if (!grunt.file.exists(options.JSONmap)) {
                grunt.fail.warn('JSON map file "' + options.JSONmap + '" not found.');
                return false;
            } else {
                JSONmap = grunt.file.readJSON(options.JSONmap)
            }

            // Iterate through files.
            this.files.forEach(function (file) {
                // We only want to change files that have been altered by Django's manifest storage.
                // These are files with an md5 has in the name.
                if(fileRegex.test(file.src[0])) {

                    let content = grunt.file.read(file.src[0]); // Get matching file content.
                    let matches = [...content.matchAll(importRegex)]; // Then get all instances of import statement
                    let replaceContent = '';

                    if (matches.length > 0) { // We have imports in content.
                        matches.forEach(function (match) {
                            // Handle path differences.
                            if (match[1].startsWith('./')) {
                                let dirname =  path.dirname(file.src[0]) + '/';
                                let fullRelativePath = match[1].replace('./', dirname);
                                let relativePath = fullRelativePath.replace(options.staticDir, '');
                                let replacementPath = JSONmap.paths[relativePath];
                                let replacementFile = './' + path.basename(replacementPath);
                                let replaceRegex = new RegExp(match[1], 'g');
                                replaceContent = content.replace(replaceRegex, replacementFile);

                            }
                        });
                    }

                    if (replaceContent.length > 0) {
                        grunt.file.write(file.src[0], replaceContent)
                    };
                }

            }, this);

            return done;
        });
};
