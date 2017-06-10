module.exports = function(grunt) {
    grunt.initConfig({

        express: {
            build: {        // Nom de la tache pour le sereveur
                options : {
                    server: ('server/server.js')
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'server.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        }
    });

    grunt.registerTask('build', ['jshint', 'express', 'express-keepalive']);
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-contrib-jshint');

};