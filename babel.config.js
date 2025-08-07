module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: [
      ['babel-preset-expo', {
        jsxImportSource: 'react',
      }],
    ],
    plugins: [
      // React Native Reanimated 插件
      'react-native-reanimated/plugin',
      
      // 模組解析器插件
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: [
            '.ios.js',
            '.android.js',
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.json',
          ],
          alias: {
            '@components': ['./src/components'],
            '@screens': ['./src/screens'],
            '@services': ['./src/services'],
            '@utils': ['./src/utils'],
            '@constants': ['./src/constants'],
            '@store': ['./src/store'],
            '@navigation': ['./src/navigation'],
            '@i18n': ['./src/i18n'],
            '@assets': ['./assets'],
            '@config': ['./src/config'],
            '@tests': ['./src/tests'],
          },
        },
      ],
      
      // 環境變數支持
      [
        'transform-inline-environment-variables',
        {
          include: ['NODE_ENV', 'EXPO_PUBLIC_*'],
        },
      ],
      
      // 可選鏈和空值合併運算符支持
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      
      // 裝飾器支持
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      
      // 類屬性支持 - 統一 loose 模式
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    ],
    
    // 開發環境配置
    env: {
      development: {
        plugins: [
          // 開發環境下的額外插件
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ],
      },
      production: {
        plugins: [
          // 生產環境下的優化插件
          'transform-remove-console',
          'transform-remove-debugger',
        ],
      },
      test: {
        plugins: [
          // 測試環境下的插件
          '@babel/plugin-transform-modules-commonjs',
        ],
      },
    },
  };
};
