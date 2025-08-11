module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ['babel-preset-expo', {
        jsxImportSource: 'react',
      }],
    ],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: [
            '.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json',
          ],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@store': './src/store',
            '@navigation': './src/navigation',
            '@i18n': './src/i18n',
            '@assets': './assets',
            '@config': './src/config',
            '@tests': './src/tests',
          },
        },
      ],
      ['transform-inline-environment-variables', {
        include: ['NODE_ENV', 'EXPO_PUBLIC_*'],
      }],
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    ],
    env: {
      development: {
        plugins: [
          ['transform-remove-console', { exclude: ['error', 'warn', 'info'] }],
        ],
      },
      production: {
        plugins: [
          'transform-remove-console',
          'transform-remove-debugger',
          ['transform-inline-environment-variables', {
            include: ['NODE_ENV', 'EXPO_PUBLIC_*'],
          }],
        ],
      },
      test: {
        plugins: [
          '@babel/plugin-transform-modules-commonjs',
        ],
      },
    },
  };
};
