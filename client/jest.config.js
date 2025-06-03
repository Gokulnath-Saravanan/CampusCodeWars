module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^axios$': require.resolve('axios')
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx|mjs)$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|@mui|@emotion|@monaco-editor|react-markdown|vfile|unist|unified|bail|is-plain-obj|trough|remark|micromark|decode-named-character-reference|character-entities|property-information|space-separated-tokens|comma-separated-tokens|hast|hastscript|web-namespaces|zwitch|html-void-elements)/)'
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      useESM: true
    }
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx']
}; 