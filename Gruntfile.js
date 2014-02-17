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
		}
	});
};
