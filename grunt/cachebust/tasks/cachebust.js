const path = require('path');

/**
 * Custom Terser task.
 * Used to minify ES6+ files.
 */
module.exports = function (grunt) {
    grunt.registerMultiTask(
        'cachebust',
        'Task to create cache busting js files.',
        function () {
            let options = this.options();
            let fileCount = 0;
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
                            if (match[1].startsWith('./')) {
                                // Handle path differences.
                                let dirname =  path.dirname(file.src[0]) + '/';
                                let fullRelativePath = match[1].replace('./', dirname);
                                let relativePath = fullRelativePath.replace(options.staticDir, '');

                                // Get cache busted file name to use in replacements.
                                let replacementPath = JSONmap.paths[relativePath];

                                if (typeof(replacementPath) !== 'undefined') {
                                    let replacementFile = './' + path.basename(replacementPath);

                                    // Replace original file with cache busted file in content.
                                    let replaceRegex = new RegExp(match[1], 'g');
                                    replaceContent = content.replace(replaceRegex, replacementFile);
                                }
                            }
                        });
                    }

                    // Update source javascript file with new content that points to cache busted imports.
                    if (replaceContent.length > 0) {
                        grunt.file.write(file.src[0], replaceContent);
                        fileCount++;
                    }
                }

            }, this);

            grunt.log.ok(
                `Replacements made in ${fileCount} ${grunt.util.pluralize(fileCount, 'file/files')}.`
            )

        });
};
