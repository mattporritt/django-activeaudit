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
            let importRegex = '';

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
                    grunt.log.writeln(file.src[0]);
                }



            }, this);

            return done;
        });
};
