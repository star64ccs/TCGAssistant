const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration for React Native
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type { import('metro-config').MetroConfig }
 */
const config = {
  ...defaultConfig,

  resolver: {
    ...defaultConfig.resolver,
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
    assetExts: [
      'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
      'mp4', 'mp3', 'wav', 'ttf', 'otf', 'woff', 'woff2',
    ],
    resolverMainFields: ['react-native', 'browser', 'main'],
    platforms: ['ios', 'android', 'native', 'web'],
    // 添加解析器優化
    unstable_enableSymlinks: false,
    unstable_enablePackageExports: true,
    // 添加模塊解析優化
    alias: {
      '@': __dirname + '/src',
      '@components': __dirname + '/src/components',
      '@screens': __dirname + '/src/screens',
      '@services': __dirname + '/src/services',
      '@utils': __dirname + '/src/utils',
      '@constants': __dirname + '/src/constants',
      '@store': __dirname + '/src/store',
    },
  },

  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    assetPlugins: ['react-native-svg-asset-plugin'],
    enableBabelRCLookup: false,
    enableHermes: true,
    // 添加轉換器優化
    minifierConfig: {
      mangle: {
        keep_fnames: true,
      },
      output: {
        ascii_only: true,
        quote_style: 3,
        wrap_iife: true,
      },
      sourceMap: {
        includeSources: false,
      },
      toplevel: false,
      compress: {
        reduce_funcs: false,
      },
    },
    // 添加代碼分割優化
    experimentalImportSupport: false,
    inlineRequires: true,
  },

  watchFolders: ['./src', './assets'],

  // 優化緩存配置
  cacheStores: [
    {
      name: 'memory',
      type: 'memory',
      maxSize: 100 * 1024 * 1024, // 100MB
    },
    {
      name: 'file',
      type: 'file',
      maxSize: 500 * 1024 * 1024, // 500MB
    },
  ],

  // 添加服務器配置優化
  server: {
    port: 8081,
    enhanceMiddleware: (middleware, server) => {
      return (req, res, next) => {
        // 添加 CORS 支持
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // 添加緩存控制
        if (req.url.includes('.bundle')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000');
        }

        return middleware(req, res, next);
      };
    },
  },

  // 添加打包優化
  maxWorkers: 4,
  resetCache: false,

  // 添加監控配置
  reporter: {
    update: (event) => {
      if (event.type === 'bundle_build_done') {
        console.log(`Bundle built in ${event.duration}ms`);
      }
    },
  },
};

module.exports = config;
