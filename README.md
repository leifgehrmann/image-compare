# image-compare

[![Build Status](https://github.com/leifgehrmann/image-compare/workflows/Tests/badge.svg?branch=main)](https://github.com/leifgehrmann/image-compare/actions)
[![Code Coverage](https://codecov.io/gh/leifgehrmann/image-compare/branch/main/graph/badge.svg)](https://codecov.io/gh/leifgehrmann/image-compare)

A single-page web application for easily comparing two or more images.

## Example

* [French Flags](https://image-compare.leifgehrmann.com/#https://image-compare.leifgehrmann.com/example/config-www.json)

## Installing the app

After cloning this repository, run:

```console
$ cd image-compare
$ npm install
$ npm run build
$ npm run serve
```

This should start a localhost server, usually `http://localhost:5000`.

For the page to load you'll need to append a URL to a config file to the URL.

```
http://localhost:5000/#https://example.com/path/to/config.json
```

## Development

```console
$ npm run dev
```

### Linting

```console
$ npm run lint
```

### Tests

To run end to end tests, in one console run:

```console
$ npm run build:test
$ npm run serve
```

`build:test` will build the app with sourcemaps, which will allow for code coverage later. 

Then in a different console, run:

```console
$ export CYPRESS_IMAGE_COMPARE_HOST='http://localhost:5000/'
$ npm run test:e2e
```

Code coverage will be generated automatically, and can be viewed in `coverage/`.

To see the cypress tests actually running in a browser, run:

``` console
$ npx cypress open
```
