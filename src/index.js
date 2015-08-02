import autoprefix from 'autoprefix';

function isStyle(node) {
  return node.name.name === 'style';
}

function isString(value) {
  return typeof value === 'string'
}

function propertiesToObject(t, props) {
  const keyedProps = {};

  props.forEach(function (prop) {
    // turn the key into a literal form
    const key = prop.toComputedKey();
    if (!t.isLiteral(key)) return; // probably computed

    // ensure that the value is a string
    const value = prop.get('value');
    if (!value.isLiteral()) return;

    // register property as one we'll try and autoprefix
    keyedProps[key.value] = value.node.value;

    // remove property as it'll get added later again later
    prop.dangerouslyRemove();
  });

  return keyedProps;
}

export default function ({ Plugin, types: t }) {
  function getValue(value) {
    return  isString(value) ? t.literal(value) : t.arrayExpression(value.map(t.literal));
  }

  function prefixStyle(path) {
    // verify this is an object as it's the only type we take
    if (!path.isObjectExpression()) return;

    // we've already prefixed this object
    if (path.getData('_autoprefixed')) return;

    // track that we've autoprefixed this so we don't do it multiple times
    path.setData('_autoprefixed', true);

    // get an object containing all the properties in this that are prefixed
    const prefixed = autoprefix(propertiesToObject(t, path.get('properties')));

    for (var key in prefixed) {
      // push new prefixed properties
      path.pushContainer('properties', t.property(
        'init',
        t.literal(key),
        Array.isArray(prefixed[key])
          ? t.valueToNode(prefixed[key].join(`;${key}:`))
          : t.valueToNode(prefixed[key]))
      );
    }
  }

  return new Plugin('react-autoprefix', {
    metadata: {
      group: 'builtin-pre'
    },

    visitor: {
      JSXAttribute(node) {
        if (isStyle(node)) {
          prefixStyle(this.get('value.expression').resolve());
        }
      }
    }
  });
}
