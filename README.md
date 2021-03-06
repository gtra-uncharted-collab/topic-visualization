# Veldt-App-Template

## Dependencies

- [Go](https://golang.org/) programming language binaries with the `GOPATH` environment variable specified and `$GOPATH/bin` in your `PATH`.
- [Go](https://golang.org/) version 1.6+.
- [NodeJS](http://nodejs.org/) JavaScript runtime.
- [gulp](http://http://gulpjs.com/) build toolkit (npm install gulp -g).

## Development

Clone the repository:

```bash
mkdir -p $GOPATH/src/github.com/gtra-uncharted-collab
cd $GOPATH/src/github.com/gtra-uncharted-collab
git clone git@github.com:gtra-uncharted-collab/topic-visualization.git
```

Install dependencies

```bash
cd topic-visualization
make install
npm install
```

## Usage

This repository is designed for rapidly developing and deploying web applications based around the [veldt](https://github.com/unchartedsoftware/veldt/) package.

To get the application up and serving, with a watch on all related source code simply run the default `gulp` task:

```bash
gulp
```
