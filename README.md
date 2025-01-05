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

## Config file schema

The config file that is loaded in the URL is a JSON file that has of a list of options.  See `src/configSchema.ts` for details on the format of each option.

```json
{
  "options": [
    {
      "label": "Dog",
      "alt": "Photograph of a Labrador Retriever",
      "src": "https://example.com/dog.png"
    },
    {
      "label": "Cat",
      "alt": "Photograph of a black cat",
      "src": "https://example.com/cat.jpg",
      "sources": [
        {
          "srcset": "https://example.com/cat.webp",
          "type": "image/webp"
        },
        {
          "srcset": "https://example.com/cat-dark.jpg",
          "media": "(prefers-color-scheme: dark)"
        },
        {
          "srcset": "https://example.com/cat-dark.webp",
          "type": "image/webp",
          "media": "(prefers-color-scheme: dark)"
        }
      ]
    },
    {
      "label": "Capybara",
      "alt": "Illustration of a capybara",
      "src": "https://example.com/capybara.svg"
    }
  ]
}
```

## Development

```console
$ npm run dev
```

Then open this URL to see an example of the app:

```
http://localhost:5173/#http://localhost:5173/example/config-local.json
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
