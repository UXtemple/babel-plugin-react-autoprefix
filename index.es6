import autoprefix from 'autoprefix';

function propertiesToObject(t, props) {
  const keyedProps = {};

  function handleSpreadProperty(node) {
    node.properties.forEach(sprop => {
      if (t.isSpreadProperty(sprop)) {
        throw new Error('TODO: handle spread properties in spread properties');
      }

      keyedProps[sprop.key.name] = sprop.value.value;
    });
  }

  props.forEach(prop => {
    if (t.isSpreadProperty(prop) && prop.argument.node) {
      handleSpreadProperty(prop.argument.node);
    } else {
      // we don't process computed properties
      if (prop.computed) return;

      // ensure that the value is a string
      if (!t.isLiteral(prop.value)) return;

      // register property as one we'll try and autoprefix
      keyedProps[prop.key.name] = prop.value.value;
    }
  });

  return keyedProps;
}

function prefixStyle(t, path) {
  // verify this is an object as it's the only type we take
  if (!t.isJSXExpressionContainer(path.node.value)) return;

  // we've already prefixed this object
  if (path.data.autoprefixed) return;

  // track that we've autoprefixed this so we don't do it multiple times
  path.data.autoprefixed = true;

  const { properties } = path.node.value.expression;
  // get an object containing all the properties in this that are prefixed
  const prefixed = properties ? autoprefix(propertiesToObject(t, properties)) : [];

  path.node.value.expression.properties = []

  for (const key in prefixed) {
    // make sure the prefixed value produces valid CSS at all times.
    const prefixedValue = Array.isArray(prefixed[key]) ? prefixed[key].join(`;${key}:`) : prefixed[key];
    // push new prefixed properties
    path.node.value.expression.properties.push(
      t.objectProperty(
        t.stringLiteral(key),
        t.valueToNode(prefixedValue)
      )
    );
  }
}

export default ({ types }) => ({
  visitor: {
    JSXAttribute(path) {
      if (path.node.name.name === 'style') {
        prefixStyle(types, path);
      }
    }
  }
});
