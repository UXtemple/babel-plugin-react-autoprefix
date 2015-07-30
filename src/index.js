import autoprefix from 'autoprefix';

function isStyle(node) {
  return node.name.name === 'style';
}

function isString(value) {
  return typeof value === 'string'
}

function propertiesToObject(properties) {
  return Object.keys(properties)
    .map(k => ({key: properties[k].key.name, value: properties[k].value.value}))
    .reduce((p, {key, value}) => ({...p, [key]: value}), {});
}

export default function ({ Plugin, types: t }) {
  function getValue(value) {
    return  isString(value) ? t.literal(value) : t.arrayExpression(value.map(t.literal));
  }

  function prefixStyle(node) {
    const prefixed = autoprefix(propertiesToObject(node.expression.properties));

    return t.objectExpression(
      Object.keys(prefixed).map(k => t.property('init', t.identifier(k), getValue(prefixed[k])))
    );
  }

  return new Plugin('react-prefix-styles', {
    metadata: {
      group: 'builtin-pre'
    },

    visitor: {
      JSXAttribute(node) {
        if (isStyle(node)) {
          node.value = prefixStyle(node.value);
        }
      }
    }
  });
}
