import { transform } from 'babel';

export default function getCode(code) {
  return transform(code, {
    plugins: ['react-autoprefix'],
    stage: 0
  }).code;
}
