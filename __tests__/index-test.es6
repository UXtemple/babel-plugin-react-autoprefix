import getCode from './get-code';
import test from 'tape';

const CODE = [
  // inline style
  '<div style={{alignItems: "center", display: "flex", width: 100}} />',

  // variable outside
  `const style={alignItems: "center", display: "flex", width: 100};
  <div style={style} />`,

  // variable outside, key in object
  `const style={stuff: {alignItems: "center", display: "flex", width: 100}};
  <div style={style.stuff} />`,

  // object shorthand
  `const display = "flex";
  const style={alignItems: "center", display, width: 100};
  <div style={style} />`,

  // object spread
  `const style={alignItems: "center", display: "flex"};
  const finalStyle={...style, width: 100};
  <div style={finalStyle} />`

  // // more advanced object spread
  // ` const style={alignItems: "center"};
  //   const midStyle={...style, display: "flex"};
  //   const finalStyle={...midStyle, width: 100};
  //   <div style={finalStyle} />`
];
const EXPECT = [
  '"webkitBoxAlign": "center"',
  '"webkitAlignItems": "center"',
  '"msFlexAlign": "center"',
  '"alignItems": "center"',
  '"display": "-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex"',
  '"width": "100"'
];

const CODE_STRING = '<div style="anything" />';
test(CODE_STRING, t => {
  const code = getCode(CODE_STRING);
  t.ok(code.indexOf('style: "anything"') !== -1);
  t.end();
});

CODE.forEach(src => {
  test(src, t => {
    const code = getCode(src);
    t.ok(EXPECT.map(text => code.indexOf(text) !== -1).reduce((p,c) => p && c, true));
    t.end();
  })
});
