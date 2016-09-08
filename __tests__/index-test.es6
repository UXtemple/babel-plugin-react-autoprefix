import getCode from './get-code';
import test from 'tape';

const CODE = [{
  name: 'inline style',
  src: '<div style={{alignItems: "center", display: "flex", width: 100}} />',
  out: `React.createElement("div",{style:{alignItems:"center",display:"-webkit-box;-ms-flexbox;flex",width:100,WebkitBoxAlign:"center",msFlexAlign:"center"}});`
}

  // // variable outside
  // `const style={alignItems: "center", display: "flex", width: 100};
  // <div style={style} />`,

  // // variable outside, key in object
  // `const style={stuff: {alignItems: "center", display: "flex", width: 100}};
  // <div style={style.stuff} />`,

  // // object shorthand
  // `const display = "flex";
  // const style={alignItems: "center", display, width: 100};
  // <div style={style} />`,

  // // object spread
  // `const style={alignItems: "center", display: "flex"};
  // const finalStyle={...style, width: 100};
  // <div style={finalStyle} />`

  // // // more advanced object spread
  // // ` const style={alignItems: "center"};
  // //   const midStyle={...style, display: "flex"};
  // //   const finalStyle={...midStyle, width: 100};
  // //   <div style={finalStyle} />`
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

CODE.forEach(code => {
  test(`${code.name}: ${code.src}`, t => {
    const transformed = getCode(code.src);
    t.equals(transformed, code.out);
    t.end();
  })
});
