const { transform } = require('babel-core')
const autoprefix = require('./index')
const objectRestSpread = require('babel-plugin-transform-object-rest-spread')
const test = require('tape')

const FIXTURES = [{
  name: 'anything',
  src: '<div style="anything" />',
  out: `React.createElement("div",{style:"anything"});`
}, {
  name: 'inline style',
  src: '<div style={{alignItems: "center", display: "flex", width: 100}} />',
  out: `React.createElement("div",{style:{"WebkitBoxAlign":"center","msFlexAlign":"center","alignItems":"center","display":"-webkit-box;display:-ms-flexbox;display:flex","width":100}});`
}, {
  name: 'variable outside',
  src: 'const from={alignItems: "center", display: "flex", width: 100};<div style={from} />',
  out: 'const from={"WebkitBoxAlign":"center","msFlexAlign":"center","alignItems":"center","display":"-webkit-box;display:-ms-flexbox;display:flex","width":100};React.createElement("div",{style:from});'
}, {
  name: 'variable outside, key in object',
  src: `const style={stuff: {alignItems: "center", display: "flex", width: 100}};<div style={style.stuff} />`,
  out: 'const style={stuff:{"WebkitBoxAlign":"center","msFlexAlign":"center","alignItems":"center","display":"-webkit-box;display:-ms-flexbox;display:flex","width":100}};React.createElement("div",{style:style.stuff});'
// }, {
  // name: 'object shorthand',
  // src: `const display = "flex"; const from={alignItems: "center", display, width: 100};<div style={from} />`,
  // out: '...'
}, {
  name: 'object spread',
  src: `const from={alignItems: "center", width: 100};const finalStyle={...from, display: "flex"};<div style={finalStyle} />`,
  out: 'var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};const from={"WebkitBoxAlign":"center","msFlexAlign":"center","alignItems":"center","width":100};const finalStyle=_extends({},from,{"display":"-webkit-box;display:-ms-flexbox;display:flex"});React.createElement("div",{style:finalStyle});'
}, {
  name: 'more advanced object spread',
  src: `const from={alignItems: "center"};const midStyle={...from, display: "flex"};const finalStyle={...midStyle, width: 100};<div style={finalStyle} />`,
  out: 'var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};const from={"WebkitBoxAlign":"center","msFlexAlign":"center","alignItems":"center"};const midStyle=_extends({},from,{"display":"-webkit-box;display:-ms-flexbox;display:flex"});const finalStyle=_extends({},midStyle,{"width":100});React.createElement("div",{style:finalStyle});'
}, {
  name: 'inline object spread',
  src: `const from={alignItems: "center"};<div style={{...from, display: "flex", width: 100}} />`,
  out: 'var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};const from={"WebkitBoxAlign":"center","msFlexAlign":"center","alignItems":"center"};React.createElement("div",{style:_extends({},from,{"display":"-webkit-box;display:-ms-flexbox;display:flex","width":100})});'
}, {
  name: 'custom tag',
  src: '<div styleCustom={{ display: "flex" }} />',
  out: `React.createElement("div",{styleCustom:{"display":"-webkit-box;display:-ms-flexbox;display:flex"}});`,
  opts: { matcher: /^styleCustom$/ }
}, {
  name: 'variable outside of scope',
  src: 'const from={alignItems: "center", display: "flex", width: 100};const fn = () => <div style={from} />',
  out: 'const from={"WebkitBoxAlign":"center","msFlexAlign":"center","alignItems":"center","display":"-webkit-box;display:-ms-flexbox;display:flex","width":100};const fn=()=>React.createElement("div",{style:from});'
}, {
  name: 'variable outside, only prefix once',
  src: 'const from={alignItems: "center", display: "flex", width: 100};<div style={from} />;<span style={from} />',
  out: 'const from={"WebkitBoxAlign":"center","msFlexAlign":"center","alignItems":"center","display":"-webkit-box;display:-ms-flexbox;display:flex","width":100};React.createElement("div",{style:from});React.createElement("span",{style:from});'
}, {
  name: 'respect external variables',
  src: 'const HEIGHT = 50; <div style={{ height: HEIGHT }} />',
  out: `const HEIGHT=50;React.createElement("div",{style:{height:HEIGHT}});`
}, {
  name: 'respect hand-prefixed styles',
  src: '<div style={{WebkitOverflowScrolling: "touch"}} />',
  out: 'React.createElement("div",{style:{"WebkitOverflowScrolling":"touch"}});'
}];

FIXTURES.forEach(f => {
  test(`${f.name}: ${f.src}`, t => {
    const transformed = transform(f.src, {
      compact: true,
      plugins: [
        [autoprefix, f.opts],
        objectRestSpread
      ],
      presets: [
        'react'
      ]
    }).code

    t.equals(transformed, f.out)

    t.end()
  })
})
