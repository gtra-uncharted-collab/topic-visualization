'use strict';

const _ = require('lodash');
const gulp = require('gulp');
const concat = require('gulp-concat');
const source = require('vinyl-source-stream');
const del = require('del');
const eslint = require('gulp-eslint');
const csso = require('gulp-csso');
const runSequence = require('run-sequence');
const gulpgo = require('gulp-go');
const browserify = require('browserify');

const project = 'topic-visualization';
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
	})
	.bundle()
	.on('error', function(err) {
		console.error(err);
		this.emit('end');
	})
	.pipe(source(`${project}.js`))
	.pipe(gulp.dest(paths.output));
});

gulp.task('build-styles', () => {
	// get all style files inside our package.json
	const json = require('./package.json');
	const deps = _.merge(json.dependencies, json.devDependencies);
	const styles = [].concat(paths.styles);
	_.keys(deps).forEach(dep => {
		const p = require(`./node_modules/${dep}/package.json`);
		if (p.style) {
			styles.push(`./node_modules/${dep}/${p.style}`);
		}
	});
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
