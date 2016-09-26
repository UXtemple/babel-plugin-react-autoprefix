const autoprefix = require('autoprefix')

const cache = {}
function mAutoprefix(name, value) {
  const key = `${name}${value}`;
  return cache[key] || (cache[key] = autoprefix({ [name]: value }));
}

function prefix(t, path, node) {
  let binding
  switch (node.type) {
    // test: variable outside
    case 'Identifier':
      binding = path.scope.getBinding(node.name)

      if (binding && binding.path.node.type === 'VariableDeclarator') {
        // we've already prefixed this object
        if (binding.path.data.autoprefixed) return
        // track that we've autoprefixed this so we don't do it multiple times
        binding.path.data.autoprefixed = true

        switch (binding.path.node.init.type) {
          // test: object spread
          // test: more advanced object spread
          case 'CallExpression':
            for (const arg of binding.path.node.init.arguments) {
            // binding.path.node.init.arguments.forEarch(arg => {
              switch (arg.type) {
                case 'Identifier':
                  prefix(t, path, path.scope.getBinding(arg.name).identifier)
                  break

                case 'ObjectExpression':
                  prefix(t, path, arg)
                  break

                default:
                  break
              }
            }
            break

          case 'ObjectExpression':
            prefix(t, path, binding.path.node.init)
            break

          default:
            break
        }
      }
      break

    // test: variable outside, key in object
    case 'MemberExpression':
      binding = path.scope.getBinding(node.object.name)
      if (binding && binding.path.node.type === 'VariableDeclarator' && binding.path.node.init.properties) {
        // we've already prefixed this object
        if (binding.path.data.autoprefixed) return
        // track that we've autoprefixed this so we don't do it multiple times
        binding.path.data.autoprefixed = true

        const subProperty = binding.path.node.init.properties.find(p => p.key.name === node.property.name)
        prefix(t, path, subProperty.value)
      }
      break

    // test: inline style
    case 'ObjectExpression':
      const nextProperties = []

      node.properties.forEach(prop => {
        // test: spread inline
        if (prop.type === 'SpreadProperty') {
          prefix(t, path, prop.argument)
          nextProperties.push(prop)
        } else {
          // we don't process computed properties
          if (prop.computed || !t.isLiteral(prop.value)) {
            nextProperties.push(prop)
            return
          }

          // // ensure that the value is a string
          // if (!t.isLiteral(prop.value)) return

          // register property as one we'll try and autoprefix
          const object = mAutoprefix(prop.key.name, prop.value.value)

          for (const key in object) {
            // make sure the prefixed value produces valid CSS at all times.
            const value = Array.isArray(object[key]) ? object[key].join(`;${key}:`) : object[key]

            nextProperties.push(
              t.objectProperty(
                t.stringLiteral(key),
                t.valueToNode(value)
              )
            )
          }
        }
      })

      node.properties = nextProperties
      break

    default: break
  }
}

module.exports = ({ types: t }) => ({
  visitor: {
    JSXAttribute(path, state) {
      const prop = path.node.name.name
      if (state.opts.matcher) {
        if (!state.opts.matcher.test(prop)) return
      } else if (prop !== 'style') {
        return
      }

      // verify this is an object as it's the only type we take
      if (!t.isJSXExpressionContainer(path.node.value)) return

      // we've already prefixed this object
      if (path.data.autoprefixed) return
      // track that we've autoprefixed this so we don't do it multiple times
      path.data.autoprefixed = true

      prefix(t, path, path.node.value.expression)
    }
  }
})
