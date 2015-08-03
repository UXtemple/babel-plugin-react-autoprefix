# babel-plugin-react-autoprefix

Adds vendor prefixes to inline styles in React elements through
[autoprefix](https://github.com/uxtemple/autoprefix).

[![Build Status](https://travis-ci.org/UXtemple/babel-plugin-react-autoprefix.svg)](https://travis-ci.org/UXtemple/babel-plugin-react-autoprefix)

## Installation

```sh
$ npm install babel-plugin-react-autoprefix
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["react-autoprefix"]
}
```

### Via CLI

```sh
$ babel --plugins react-autoprefix script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["react-autoprefix"]
});
```

# TODO

- Refactor how we deal with `SpreadProperty` nodes.
