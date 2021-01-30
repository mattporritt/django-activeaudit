const Terser = require('terser');
let done;
let fileCount = 0;
let counter = 0;
let createdFiles = 0;

/**
 * Handle output when all files have been processed.
 */
const processingDone = (grunt) => {
    if(counter === fileCount) {
        if (createdFiles > 0) {
            grunt.log.ok(
                `${createdFiles} ${grunt.util.pluralize(createdFiles, 'file/files')} created.`
            );
        }
        done();
    }
};

/**
 * Custom Terser task.
 * Used to minify ES6+ files.
 */
module.exports = function (grunt) {
    grunt.registerMultiTask(
        'terser',
        'Task to run Terser to minify JS files.',
        function () {
            done = this.async();  // Force task into async mode and grab a handle to the "done" function.
            let options = this.options();
            fileCount = this.files.length;

            // Iterate through files.
            this.files.forEach(function (file) {
                // Check if file actually exists (it always should).
                if (!grunt.file.exists(file.src[0])) {
                    grunt.log.warn('Source file "' + file.src[0] + '" not found.');
                    return false;
                } else {
                    let filesrc = grunt.file.read(file.src);
                    Terser.minify(filesrc, options).then(result => {
                        // Write the destination file.
                        grunt.file.write(file.dest, result.code);
                        createdFiles++;
                        counter++;
                        processingDone(grunt);

                        if (options.sourceMap) {
                            // Write the source map file.
                            let mapFileName = file.dest + '.map';
                            grunt.file.write(mapFileName, result.map);
                        }

                    }).catch(error => {
                        grunt.log.writeln(error);
                        counter++;
                        processingDone(grunt);
                    });
                }

            }, this);
        });
};
