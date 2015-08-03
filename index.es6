import autoprefix from 'autoprefix';

const isFunction = value => typeof value === 'function';
const isString = value => typeof value === 'string';
const isStyle = node => node.name.name === 'style';

function propertiesToObject(t, props) {
  const keyedProps = {};

  function handleSpreadProperty(node) {
    if (typeof node.properties === 'undefined') return;

    node.properties.forEach(sprop => {
      if (t.isSpreadProperty(sprop)) {
        throw new Error('TODO: handle spread properties in spread properties');
      }

      keyedProps[sprop.key.name] = sprop.value.value;
    });
  }

  props.forEach(prop => {
    if (t.isSpreadProperty(prop)) {
      handleSpreadProperty(prop.get('argument').resolve().node);
    } else {
      // turn the key into a literal form
      const key = prop.toComputedKey();
      if (!t.isLiteral(key)) return; // probably computed

      // ensure that the value is a string
      const value = prop.get('value').resolve();
      if (!value.isLiteral()) return;

      // register property as one we'll try and autoprefix
      keyedProps[key.value] = value.node.value;
    }

    // remove property as it'll get added later again later
    prop.dangerouslyRemove();
  });

  return keyedProps;
}

export default function ({ Plugin, types: t }) {
  function getValue(value) {
    return isString(value) ? t.literal(value) : t.arrayExpression(value.map(t.literal));
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
      // make sure the prefixed value produces valid CSS at all times.
      const prefixedValue = Array.isArray(prefixed[key]) ? prefixed[key].join(`;${key}:`) : prefixed[key];

      // push new prefixed properties
      path.pushContainer('properties', t.property(
        'init',
        t.literal(key),
        t.valueToNode(prefixedValue))
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
          prefixStyle(this.get('value.expression').resolve(true));
        }
      }
    }
  });
}
