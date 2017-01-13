'use strict';

const _ = require('lodash');
const babel = require('babelify');
const browserify = require('browserify');
const concat = require('gulp-concat');
const csso = require('gulp-csso');
const del = require('del');
const eslint = require('gulp-eslint');
const fs = require('fs');
const gulp = require('gulp');
const gulpgo = require('gulp-go');
const path = require('path');
const runSequence = require('run-sequence');
const source = require('vinyl-source-stream');

const project = 'prism-app';
const publicDir = './public';
const nodeModules = './node_modules';
const goPath = process.env.GOPATH;
const paths = {
	serverRoot: './main.go',
	webappRoot: `${publicDir}/app.js`,
	scripts: [
		`${publicDir}/scripts/**/*.js`,
		`${publicDir}/app.js`,
		`${publicDir}/config.js`
	],
	links: [
		`${nodeModules}/prism-client/scripts/**/*.js`,
		`${nodeModules}/prism-ui/scripts/**/*.js`,
		`${nodeModules}/lumo/src/**/*.js`,
	],
	styles: [
		`${publicDir}/styles/reset.css`,
		`${publicDir}/styles/**/*.css`
	],
	go: [
		'.',
		`${goPath}/src/github.com/unchartedsoftware/prism`,
		`${goPath}/src/github.com/unchartedsoftware/prism-server`
	],
	index: [
		`${publicDir}/index.html`
	],
	lint: [
		`${publicDir}/**/*.js`,
	],
	resources: [
		`${publicDir}/index.html`,
		`${publicDir}/favicons/*`,
		`${publicDir}/images/*`
	],
	output: './build/public'
};

gulp.task('clean', () => {
	del.sync(paths.output);
});

gulp.task('lint', () => {
	return gulp.src(paths.scripts)
		.pipe(eslint())
		.pipe(eslint.format());
});

gulp.task('build-scripts', () => {
	return browserify(paths.webappRoot, {
		debug: true,
		standalone: project
	}).transform(babel, {
		global: true,
		ignore: /\/node_modules\/(?!((lumo\/)|(prism\-client\/)))/,
		compact: true,
		presets: [ 'es2015' ]
	})
	.bundle()
	.on('error', function(err) {
		console.error(err);
		this.emit('end');
	})
	.pipe(source(`${project}.js`))
	.pipe(gulp.dest(paths.output));
});

function getPackageStyles(dir = '.', styles = []) {
	// load package.json, if it exists
	let json;
	try {
		json = require(`./${path.join(dir, 'package.json')}`);
	} catch(e) {
		return styles;
	}
	// check if it is root, or if it has style attribute
	if (dir === '.' || json.style) {
		if (json.style) {
			// add style to front of array so higher level packages override
			// nested packages
			styles.unshift(path.join(dir, json.style));
		}
		// check if nested node_modules
		const modulesDir = path.join(dir, 'node_modules');
		if (fs.existsSync(modulesDir)) {
			// get all packages inside
			fs.readdirSync(modulesDir).forEach(file => {
				// recurse
				const packageDir = path.join(dir, 'node_modules', file);
				if (fs.statSync(packageDir).isDirectory()) {
					styles = getPackageStyles(packageDir, styles);
				}
			});
		}
	}
	return styles;
}

gulp.task('build-styles', () => {
	// get all style files inside our package.json
	let styles = getPackageStyles();
	// append project scope styles last to override
	styles = styles.concat(paths.styles);
	// bundle them
	return gulp.src(styles)
		.pipe(csso())
		.pipe(concat(`${project}.css`))
		.pipe(gulp.dest(paths.output));
});

gulp.task('copy-resources', () => {
	return gulp.src(paths.resources, {
			base: publicDir
		})
		.pipe(gulp.dest(paths.output));
});

gulp.task('build', done => {
	runSequence(
		[
			'clean',
			'lint'
		],
		[
			'build-scripts',
			'build-styles',
			'copy-resources'
		],
		done);
});

let go;
gulp.task('serve', () => {
	go = gulpgo.run(paths.serverRoot, [], {
		cwd: __dirname,
		stdio: 'inherit'
	});
});

gulp.task('watch', () => {
	// go
	const goWatch = [];
	paths.go.forEach(function(lib) {
		goWatch.push(`${lib}/**/*.go`);
		goWatch.push(`!${lib}/vendor/**/*`);
	});
	gulp.watch(goWatch).on('change', () => {
		go.restart();
	});
	// javascript
	gulp.watch(paths.scripts.concat(paths.links), ['build-scripts']);
	// css
	gulp.watch(paths.styles, ['build-styles']);
	// misc
	gulp.watch(paths.resources, ['copy-resources']);
});

gulp.task('default', done => {
	// runs with watches attached to this project only
	runSequence(
		['build'],
		['watch'],
		['serve'],
		done);
});
