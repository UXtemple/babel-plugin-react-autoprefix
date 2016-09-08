import { transform } from 'babel-core';
import autoprefix from '../index';

export default function getCode(code) {
  return transform(code, {
    compact: true,
    plugins: [
      autoprefix
    ],
    presets: [
      'react'
    ]
  }).code;
}
