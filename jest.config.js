module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['out', 'assets', 'docker-compose-data'],
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', {
      isolatedModules: true,
    }],
  },
};