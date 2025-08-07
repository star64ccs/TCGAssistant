// 部署配置文件
const deployConfig = {
  // 環境配置
  environments: {
    development: {
      name: '開發環境',
      apiUrl: 'http://localhost:3000/api/v1',
      webUrl: 'http://localhost:3001',
      features: {
        debug: true,
        analytics: false,
        notifications: false,
        cache: false,
      },
      database: {
        host: 'localhost',
        port: 5432,
        name: 'tcg_assistant_dev',
        user: 'dev_user',
        password: 'dev_password',
      },
      redis: {
        host: 'localhost',
        port: 6379,
        password: null,
      },
      storage: {
        type: 'local',
        path: './uploads',
        maxSize: '100MB',
      },
      email: {
        host: 'localhost',
        port: 1025,
        secure: false,
        user: 'dev@tcg-assistant.com',
        password: 'dev_password',
      },
      payment: {
        provider: 'stripe',
        testMode: true,
        publicKey: 'pk_test_...',
        secretKey: 'sk_test_...',
      },
    },
    
    staging: {
      name: '測試環境',
      apiUrl: 'https://staging-api.tcg-assistant.com/api/v1',
      webUrl: 'https://staging.tcg-assistant.com',
      features: {
        debug: true,
        analytics: true,
        notifications: true,
        cache: true,
      },
      database: {
        host: 'staging-db.tcg-assistant.com',
        port: 5432,
        name: 'tcg_assistant_staging',
        user: 'staging_user',
        password: process.env.STAGING_DB_PASSWORD,
      },
      redis: {
        host: 'staging-redis.tcg-assistant.com',
        port: 6379,
        password: process.env.STAGING_REDIS_PASSWORD,
      },
      storage: {
        type: 's3',
        bucket: 'tcg-assistant-staging',
        region: 'ap-northeast-1',
        accessKey: process.env.STAGING_S3_ACCESS_KEY,
        secretKey: process.env.STAGING_S3_SECRET_KEY,
      },
      email: {
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
        user: process.env.STAGING_EMAIL_USER,
        password: process.env.STAGING_EMAIL_PASSWORD,
      },
      payment: {
        provider: 'stripe',
        testMode: true,
        publicKey: process.env.STAGING_STRIPE_PUBLIC_KEY,
        secretKey: process.env.STAGING_STRIPE_SECRET_KEY,
      },
    },
    
    production: {
      name: '生產環境',
      apiUrl: 'https://api.tcg-assistant.com/api/v1',
      webUrl: 'https://tcg-assistant.com',
      features: {
        debug: false,
        analytics: true,
        notifications: true,
        cache: true,
      },
      database: {
        host: 'prod-db.tcg-assistant.com',
        port: 5432,
        name: 'tcg_assistant_prod',
        user: 'prod_user',
        password: process.env.PROD_DB_PASSWORD,
      },
      redis: {
        host: 'prod-redis.tcg-assistant.com',
        port: 6379,
        password: process.env.PROD_REDIS_PASSWORD,
      },
      storage: {
        type: 's3',
        bucket: 'tcg-assistant-prod',
        region: 'ap-northeast-1',
        accessKey: process.env.PROD_S3_ACCESS_KEY,
        secretKey: process.env.PROD_S3_SECRET_KEY,
      },
      email: {
        host: 'smtp.mailgun.org',
        port: 587,
        secure: false,
        user: process.env.PROD_EMAIL_USER,
        password: process.env.PROD_EMAIL_PASSWORD,
      },
      payment: {
        provider: 'stripe',
        testMode: false,
        publicKey: process.env.PROD_STRIPE_PUBLIC_KEY,
        secretKey: process.env.PROD_STRIPE_SECRET_KEY,
      },
    },
  },
  
  // 部署腳本
  scripts: {
    // 前端構建
    build: {
      development: 'npm run build:dev',
      staging: 'npm run build:staging',
      production: 'npm run build:prod',
    },
    
    // 測試
    test: {
      unit: 'npm run test:unit',
      integration: 'npm run test:integration',
      e2e: 'npm run test:e2e',
      coverage: 'npm run test:coverage',
    },
    
    // 代碼檢查
    lint: {
      check: 'npm run lint',
      fix: 'npm run lint:fix',
    },
    
    // 部署
    deploy: {
      development: 'npm run deploy:dev',
      staging: 'npm run deploy:staging',
      production: 'npm run deploy:prod',
    },
    
    // 回滾
    rollback: {
      staging: 'npm run rollback:staging',
      production: 'npm run rollback:prod',
    },
  },
  
  // 監控配置
  monitoring: {
    // 應用性能監控
    apm: {
      provider: 'sentry',
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    },
    
    // 日誌
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'json',
      destination: process.env.LOG_DESTINATION || 'console',
    },
    
    // 健康檢查
    healthCheck: {
      endpoint: '/health',
      interval: 30000, // 30秒
      timeout: 5000, // 5秒
    },
    
    // 告警
    alerts: {
      email: process.env.ALERT_EMAIL,
      slack: process.env.SLACK_WEBHOOK_URL,
      thresholds: {
        errorRate: 0.05, // 5%
        responseTime: 2000, // 2秒
        cpuUsage: 0.8, // 80%
        memoryUsage: 0.8, // 80%
      },
    },
  },
  
  // 安全配置
  security: {
    // CORS
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-Membership-Type'],
    },
    
    // 速率限制
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分鐘
      max: 100, // 每個IP每15分鐘最多100個請求
      message: '請求過於頻繁，請稍後再試',
    },
    
    // JWT
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
      refreshExpiresIn: '30d',
    },
    
    // 加密
    encryption: {
      algorithm: 'aes-256-gcm',
      key: process.env.ENCRYPTION_KEY,
    },
  },
  
  // 備份配置
  backup: {
    database: {
      schedule: '0 2 * * *', // 每天凌晨2點
      retention: 30, // 保留30天
      compression: true,
    },
    
    files: {
      schedule: '0 3 * * *', // 每天凌晨3點
      retention: 7, // 保留7天
      compression: true,
    },
  },
  
  // CI/CD 配置
  ci: {
    // GitHub Actions
    github: {
      workflows: {
        test: '.github/workflows/test.yml',
        deploy: '.github/workflows/deploy.yml',
        security: '.github/workflows/security.yml',
      },
    },
    
    // 部署步驟
    deployment: {
      steps: [
        'checkout',
        'install-dependencies',
        'run-tests',
        'build',
        'deploy',
        'health-check',
        'notify',
      ],
    },
    
    // 環境變數
    environment: {
      required: [
        'NODE_ENV',
        'DATABASE_URL',
        'REDIS_URL',
        'JWT_SECRET',
        'API_KEY',
      ],
      optional: [
        'SENTRY_DSN',
        'SLACK_WEBHOOK_URL',
        'EMAIL_SERVICE',
      ],
    },
  },
  
  // 性能優化
  performance: {
    // 快取
    cache: {
      redis: {
        ttl: 3600, // 1小時
        maxMemory: '256mb',
        evictionPolicy: 'allkeys-lru',
      },
      
      cdn: {
        provider: 'cloudflare',
        domain: 'cdn.tcg-assistant.com',
        ttl: 86400, // 24小時
      },
    },
    
    // 圖片優化
    images: {
      compression: {
        quality: 80,
        format: 'webp',
        resize: {
          thumbnail: { width: 200, height: 200 },
          medium: { width: 800, height: 800 },
          large: { width: 1920, height: 1920 },
        },
      },
      
      storage: {
        local: './uploads/images',
        s3: 'tcg-assistant-images',
      },
    },
    
    // 數據庫優化
    database: {
      connectionPool: {
        min: 5,
        max: 20,
        acquireTimeout: 60000,
        idleTimeout: 30000,
      },
      
      indexing: {
        cards: ['name', 'series', 'rarity'],
        users: ['email', 'username'],
        collections: ['userId', 'cardId'],
      },
    },
  },
  
  // 文檔配置
  documentation: {
    api: {
      swagger: {
        enabled: true,
        path: '/api-docs',
        options: {
          title: 'TCG Assistant API',
          version: '1.0.0',
          description: 'TCG卡牌助手API文檔',
        },
      },
    },
    
    deployment: {
      readme: 'README.md',
      changelog: 'CHANGELOG.md',
      architecture: 'ARCHITECTURE.md',
    },
  },
};

// 獲取當前環境配置
function getConfig(environment = process.env.NODE_ENV || 'development') {
  return deployConfig.environments[environment] || deployConfig.environments.development;
}

// 驗證環境變數
function validateEnvironment() {
  const config = getConfig();
  const required = deployConfig.ci.environment.required;
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`缺少必要的環境變數: ${missing.join(', ')}`);
  }
  
  return true;
}

// 生成部署腳本
function generateDeployScript(environment) {
  const config = getConfig(environment);
  
  return {
    preDeploy: [
      'npm run lint',
      'npm run test',
      'npm run build',
    ],
    
    deploy: [
      'docker build -t tcg-assistant .',
      `docker tag tcg-assistant:latest tcg-assistant:${environment}`,
      `docker push tcg-assistant:${environment}`,
      `kubectl set image deployment/tcg-assistant tcg-assistant=tcg-assistant:${environment}`,
    ],
    
    postDeploy: [
      'kubectl rollout status deployment/tcg-assistant',
      'npm run health-check',
      'npm run notify:deploy-success',
    ],
    
    rollback: [
      'kubectl rollout undo deployment/tcg-assistant',
      'kubectl rollout status deployment/tcg-assistant',
      'npm run notify:rollback',
    ],
  };
}

// 導出配置
export default deployConfig;
export { getConfig, validateEnvironment, generateDeployScript };
