/* eslint-disable */
module.exports = {
  // [...]
  // Replace `ts-jest` with the preset you want to use
  // from the above list
  preset: 'ts-jest/presets/js-with-babel',

  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },

  globals: {
    // Need this to force the tsx compilation before jest runs
    'ts-jest': {
      tsConfig: 'tsconfig.jest.json'
    }
  }
};
