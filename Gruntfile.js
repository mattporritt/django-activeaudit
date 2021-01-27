module.exports = grunt => {
    const sass = require('node-sass');
    const zlib = require('zlib')

    // Load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt)
    grunt.task.loadTasks('grunt/terser/tasks')

    /**
     * Grunt config.
     */
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
        terser: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1,
                sourceMap: true
            },
            target: {
                files: [{
                    expand: true,
                    cwd: 'activeaudit/staticfiles/assets/js/src',
                    src: ['**/*.js', '!**/*.min.css', '!**/*.map'],
                    dest: 'activeaudit/staticfiles/assets/js/build',
                    ext: '.js'
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
            },
        },
        compress: {
            main: {
                options: {
                    mode: 'brotli',
                    brotli: {
                        mode: 0,
                        quality: 11
                    },
                    pretty: true
                },
                files: [
                    {expand: true, cwd: 'static/', src: ['**/*.js'], dest: 'static/', extDot: 'last', ext: '.js.br'},
                    {expand: true, cwd: 'static/', src: ['**/*.css'], dest: 'static/', extDot: 'last', ext: '.css.br'},
                    {expand: true, cwd: 'static/', src: ['**/*.map'], dest: 'static/', extDot: 'last', ext: '.map.br'},
                    {expand: true, cwd: 'static/', src: ['**/*.eot'], dest: 'static/', extDot: 'last', ext: '.eot.br'},
                    {expand: true, cwd: 'static/', src: ['**/*.svg'], dest: 'static/', extDot: 'last', ext: '.svg.br'},
                    {expand: true, cwd: 'static/', src: ['**/*.woff'], dest: 'static/', extDot: 'last', ext: '.woff.br'},
                    {expand: true, cwd: 'static/', src: ['**/*.woff2'], dest: 'static/', extDot: 'last', ext: '.woff2.br'},
                    {expand: true, cwd: 'static/', src: ['**/*.png'], dest: 'static/', extDot: 'last', ext: '.png.br'},
                    {expand: true, cwd: 'static/', src: ['**/*.jpg'], dest: 'static/', extDot: 'last', ext: '.jpg.br'},
                ]

            }
        }
    });

    grunt.registerTask('default', ['sass', 'cssmin', 'terser', 'shell', 'compress']);
};
