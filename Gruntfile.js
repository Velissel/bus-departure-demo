module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    options: {
      src: 'app/bus-departures-demo',
      libs: 'app/libs',
      dist: 'public'
    },
    // pkg: grunt.file.readJSON('package.json'),

    concat: {
      libs: {
        src: [
          '<%= options.libs%>/jquery/dist/jquery.min.js',
          '<%= options.libs %>/react/react-with-addons.min.js',
          // '<%= options.libs %>/react/JSXTransformer.js',
          '<%= options.libs %>/eventEmitter/EventEmitter.min.js'
        ],
        dest: '<%= options.dist %>/scripts/demo.libs.compiled.js'
      },
      demo: {
        src: [
          '<%= options.src %>/**/*.js'
        ],
        dest: '<%= options.dist %>/scripts/demo.app.compiled.js'
      },
      jsx: {
        src: [
          '<%= options.dist %>/scripts/jsx/**/*.js',
          '!<%= options.dist %>/scripts/jsx/**/*-setup.js',
          '<%= options.dist %>/scripts/jsx/**/*-setup.js',
        ],
        dest: '<%= options.dist %>/scripts/demo.jsx.compiled.js'
      }
    },

    uglify: {
      demo: {
        src: [
          '<%= options.dist %>/scripts/demo.libs.compiled.js',
          '<%= options.dist %>/scripts/demo.app.compiled.js',
          '<%= options.dist %>/scripts/demo.jsx.compiled.js'
        ],
        dest: '<%= options.dist %>/scripts/demo.min.js'
      }
    },

    babel: {
      jsx: {
        expand: true,
        src: ['**/*.jsx'],
        dest: '<%= options.dist %>/scripts/jsx',
        cwd: '<%= options.src %>',
        ext: '.js'
      }
    },

    watch: {
      scripts: {
        files: '<%= options.src %>/**/*.js',
        tasks: ['concat:demo']
      },
      jsx: {
        files: '<%= options.src %>/**/*.jsx',
        tasks: ['babel:jsx', 'concat:jsx']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-babel');

  // Default task(s).
  grunt.registerTask('default', ['babel', 'concat', 'uglify']);
  grunt.registerTask('dev', ['babel', 'concat']);
};