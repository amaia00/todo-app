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
            files: ['Gruntfile.js', 'server/server.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },
        less: {
            development: {
        options: {
            paths: ["Less"],
            yuicompress: true
        },
        files: {
            "./style/style.css": "Less/style.less"
        }
    }
},
    watch: {
        files: "./Less/*",
        tasks: ["less"]
    }
});

    grunt.registerTask('build', ['less', 'jshint', 'express', 'express-keepalive']);
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

};