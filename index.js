'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _autoprefix = require('autoprefix');

var _autoprefix2 = _interopRequireDefault(_autoprefix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function propertiesToObject(t, props) {
  var keyedProps = {};

  function handleSpreadProperty(node) {
    if (!node || !node.properties) return;

    node.properties.forEach(function (sprop) {
      if (t.isSpreadProperty(sprop)) {
        throw new Error('TODO: handle spread properties in spread properties');
      }

      keyedProps[sprop.key.name] = sprop.value.value;
    });
  }

  props.forEach(function (prop) {
    if (t.isSpreadProperty(prop)) {
      handleSpreadProperty(prop.argument.node);
    } else {
      // we don't process computed properties
      if (prop.computed) return;

      // ensure that the value is a string
      if (!t.isLiteral(prop.value)) return;

      // register property as one we'll try and autoprefix
      keyedProps[prop.key.name] = prop.value.value;
    }

    // // remove property as it'll get added later again later
    // prop.dangerouslyRemove();
  });

  return keyedProps;
}

function prefixStyle(t, path) {
  /* console.log(path.node.value) */
  // verify this is an object as it's the only type we take
  if (!t.isJSXExpressionContainer(path.node.value)) return;

  // console.log('props', path.node.properties)

  // we've already prefixed this object
  if (path.data.autoprefixed) return;

  // track that we've autoprefixed this so we don't do it multiple times
  path.data.autoprefixed = true;

  var properties = path.node.value.expression.properties;
  // get an object containing all the properties in this that are prefixed

  var prefixed = properties ? (0, _autoprefix2.default)(propertiesToObject(t, properties)) : [];

  for (var key in prefixed) {
    // make sure the prefixed value produces valid CSS at all times.
    var prefixedValue = Array.isArray(prefixed[key]) ? prefixed[key].join(';' + key + ':') : prefixed[key];

    // push new prefixed properties
    path.node.value.expression.properties.push(t.objectProperty(t.stringLiteral(key), t.valueToNode(prefixedValue)));
  }
}

exports.default = function (_ref) {
  var types = _ref.types;
  return {
    visitor: {
      JSXAttribute: function JSXAttribute(path) {
        if (path.node.name.name === 'style') {
          prefixStyle(types, path);
        }
      }
    }
  };
};