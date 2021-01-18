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
        shell: {
            collectStatic: {
                command: './manage.py collectstatic --noinput'
            }
        }
    });

    grunt.registerTask('default', ['sass', 'shell']);
};
