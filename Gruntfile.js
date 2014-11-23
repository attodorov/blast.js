"use strict";

var config = {
	dev: "src",
	dist: "build",
	lib: "lib",
	test: "test"
};

module.exports = function( grunt ) {
	require("load-grunt-tasks")(grunt); //from package.json
	require("time-grunt")(grunt);
	
	grunt.initConfig({
		config: config,
		env: {
			options: {
				
			},
			dev: {

			}
		},
		jshint: {
			options: {
				jshintrc: ".jshintrc",
				reporter: require("jshint-stylish"),
				ignores: ["<%= config.dev %>/*.min.js"]

			},
			changed: [],
			all: [
				"Gruntfile.js",
				"<%= config.dev %>/*.js"
			]
		},
		uglify: {
			dist: {
				files: {
					"<%= config.dist %>/blast.min.js": ["<%= config.dev %>/blast.js"]
				}
			}
		},
		cheetah: {
			dist: {
				files: {
					"<%= config.dist %>/blast.gen.js": ["<%= config.dev %>/blast.js"]
				}
			}
		},
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					quiet: false
				},
				src: ['test/**/*.js', 'perftest/**/*.js']
			}
		},
		mochaPerfTest: {
			test: {
				options: {
					reporter: 'spec',
					quiet: false
				},
				src: ['perftest/**/*.js']
			}
		}
	});
	grunt.registerTask('default', ['uglify', 'mochaTest']);
	grunt.registerTask('test', ['uglify', 'cheetah', 'mochaTest']);
	//grunt.registerTask('perftest', ['uglify', 'cheetah', 'mochaPerfTest']);
};
