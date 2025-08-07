const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * Metro configuration for React Native
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  ...getDefaultConfig(__dirname),
  
  // 優化解析器配置
  resolver: {
    ...getDefaultConfig(__dirname).resolver,
    
    // 支持的文件擴展名
    sourceExts: [
      'js',
      'jsx',
      'json',
      'ts',
      'tsx',
      'cjs',
      'mjs',
    ],
    
    // 資產文件擴展名
    assetExts: [
      'png',
      'jpg',
      'jpeg',
      'gif',
      'webp',
      'svg',
      'mp4',
      'mp3',
      'wav',
      'ttf',
      'otf',
      'woff',
      'woff2',
    ],
    
    // 解析器插件
    resolverMainFields: ['react-native', 'browser', 'main'],
    
    // 別名配置
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
    },
  },
  
  // 轉換器配置
  transformer: {
    ...getDefaultConfig(__dirname).transformer,
    
    // Babel 配置
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    
    // 支持 SVG 轉換
    assetPlugins: ['react-native-svg-asset-plugin'],
    
    // 優化配置
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
  },
  
  // 監視器配置
  watchFolders: [
    // 監視額外的文件夾
    './src',
    './assets',
  ],
  
  // 快取配置
  cacheStores: [
    {
      name: 'metro-cache',
      type: 'file',
      options: {
        maxAge: 24 * 60 * 60 * 1000, // 24小時
        maxSize: 100 * 1024 * 1024, // 100MB
      },
    },
  ],
  
  // 服務器配置
  server: {
    port: 8081,
    enhanceMiddleware: (middleware, server) => {
      return (req, res, next) => {
        // 添加 CORS 支持
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return middleware(req, res, next);
      };
    },
  },
  
  // 優化配置
  maxWorkers: 4,
  resetCache: false,
};

module.exports = config;
