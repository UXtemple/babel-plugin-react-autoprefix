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

```js
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

## Changing the matching pattern

The plugin will match `style` props by default. If you want to match other props, like
`styleSomething`, you can use the plugin's `matcher` option, e.g. in `.babelrc`:

```js
{
  "plugins": ["react-autoprefix", { matcher: /^style.*$/ }]
}
```
