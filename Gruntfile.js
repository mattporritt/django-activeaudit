module.exports = grunt => {
    const sass = require('node-sass');

    // Load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt)

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            options: {
                implementation: sass,
                sourceMap: true
            },
            dist: {
                files: {
                    'activeaudit/staticfiles/assets/css/main.css': 'activeaudit/staticfiles/scss/main.scss'
                }
            }
        },
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1,
                sourceMap: true
            },
            target: {
                files: [{
                    expand: true,
                    cwd: 'activeaudit/staticfiles/assets/css',
                    src: ['*.css', '!*.min.css', '!*.map'],
                    dest: 'activeaudit/staticfiles/assets/css',
                    ext: '.min.css'
                }]
            }
        },
        shell: {
            removeCSS: {
                // Remove compiled CSS and only keep minified css
                command: 'find ./activeaudit/staticfiles/assets/css -type f ! -name \'*.min.*\' -delete -print'
            },
            collectStatic: {
                command: './manage.py collectstatic --noinput'
            }
        }
    });

    grunt.registerTask('default', ['sass', 'cssmin', 'shell']);
};
